import requestsRepository from "../../repositories/requests.repository.js";
import logsRepository from "../../repositories/logs.repository.js";
import prisma from "../../prisma.js";

class DirectorRequestsService {
  normalizeRole(role) {
    return String(role || "").trim().toLowerCase();
  }

  formatRecipient(user) {
    const profile = user.users_profiles?.[0];
    const fullName = `${profile?.profiles?.first_name || ""} ${profile?.profiles?.last_name || ""}`.trim();

    return {
      id: user.id,
      username: user.username,
      role: this.normalizeRole(user.roles?.role_name) || null,
      email: profile?.email || null,
      name: fullName || user.username,
      recipientType: this.normalizeRole(user.roles?.role_name) === "patient" ? "patient" : "staff",
    };
  }

  patientSearchWhere(search) {
    const trimmedSearch = String(search || "").trim();
    if (!trimmedSearch) return {};

    return {
      OR: [
        { username: { contains: trimmedSearch, mode: "insensitive" } },
        {
          users_profiles: {
            some: {
              email: { contains: trimmedSearch, mode: "insensitive" },
            },
          },
        },
        {
          users_profiles: {
            some: {
              profiles: {
                OR: [
                  { first_name: { contains: trimmedSearch, mode: "insensitive" } },
                  { last_name: { contains: trimmedSearch, mode: "insensitive" } },
                ],
              },
            },
          },
        },
      ],
    };
  }

  async getPatientHospitalIds(patientId) {
    const links = await prisma.patients_hospitals.findMany({
      where: { patient_id: patientId },
      select: { hospital_id: true },
    });

    return links.map((link) => link.hospital_id);
  }

  staffRoleWhere(roleNames) {
    return {
      roles: {
        OR: roleNames.map((role) => ({
          role_name: {
            equals: role,
            mode: "insensitive",
          },
        })),
      },
    };
  }

  async buildRecipientWhere(currentUserId, currentRole, hospitalId, type, search, targetReceiverId = null) {
    const normalizedRole = this.normalizeRole(currentRole);
    const base = {
      id: { not: currentUserId },
      ...(targetReceiverId ? { id: targetReceiverId } : {}),
    };
    const patientRole = this.staffRoleWhere(["patient"]);
    const patientSearch = type === "patient" || targetReceiverId ? this.patientSearchWhere(search) : {};

    if (normalizedRole === "patient") {
      if (type === "patient") return null;
      const hospitalIds = await this.getPatientHospitalIds(currentUserId);
      if (hospitalIds.length === 0) return null;

      return {
        ...base,
        ...this.staffRoleWhere(["doctor"]),
        staff_hospitals_departments: {
          some: {
            hospital_id: { in: hospitalIds },
          },
        },
      };
    }

    if (normalizedRole === "doctor") {
      if (type === "patient") {
        return {
          ...base,
          ...patientRole,
          ...patientSearch,
          appointments_made: {
            some: {
              appointments_booking_slots: {
                doctor_id: currentUserId,
              },
            },
          },
        };
      }

      return {
        ...base,
        OR: [
          {
            ...this.staffRoleWhere(["doctor"]),
            staff_hospitals_departments: {
              some: {
                hospital_id: hospitalId,
              },
            },
          },
          {
            ...this.staffRoleWhere(["director"]),
            staff_hospitals_departments: {
              some: {
                hospital_id: hospitalId,
              },
            },
          },
        ],
      };
    }

    if (normalizedRole === "nurse") {
      if (type === "patient") return null;

      return {
        ...base,
        OR: [
          {
            ...this.staffRoleWhere(["doctor"]),
            staff_hospitals_departments: {
              some: {
                hospital_id: hospitalId,
              },
            },
          },
          {
            ...this.staffRoleWhere(["director"]),
            staff_hospitals_departments: {
              some: {
                hospital_id: hospitalId,
              },
            },
          },
        ],
      };
    }

    if (normalizedRole === "director") {
      if (type === "patient") {
        return {
          ...base,
          ...patientRole,
          ...patientSearch,
          patients_hospitals: {
            some: {
              hospital_id: hospitalId,
            },
          },
        };
      }

      return {
        ...base,
        OR: [
          {
            ...this.staffRoleWhere(["doctor", "nurse"]),
            staff_hospitals_departments: {
              some: {
                hospital_id: hospitalId,
              },
            },
          },
          this.staffRoleWhere(["superuser"]),
        ],
      };
    }

    if (normalizedRole === "superuser") {
      if (type === "patient") {
        return {
          ...base,
          ...patientRole,
          ...patientSearch,
        };
      }

      return {
        ...base,
        NOT: patientRole,
      };
    }

    return null;
  }

  async getRequestRecipients(currentUserId, hospitalId, currentRole = "director", options = {}) {
    const type = options.type === "patient" ? "patient" : "staff";
    const search = String(options.search || "").trim();

    if (type === "patient" && search.length < 2) {
      return [];
    }

    const where = await this.buildRecipientWhere(currentUserId, currentRole, hospitalId, type, search);
    if (!where) return [];

    const users = await prisma.users.findMany({
      where,
      include: {
        roles: true,
        users_profiles: {
          include: {
            profiles: true,
          },
        },
      },
      orderBy: {
        username: "asc",
      },
      take: type === "patient" ? 20 : undefined,
    });

    return users
      .map((user) => this.formatRecipient(user))
      .sort((a, b) => (a.name || a.username).localeCompare(b.name || b.username));
  }

  async isAllowedRecipient(currentUserId, hospitalId, currentRole, receiverId) {
    const receiver = await prisma.users.findUnique({
      where: { id: receiverId },
      include: { roles: true },
    });
    if (!receiver) return false;

    const receiverType = this.normalizeRole(receiver.roles?.role_name) === "patient" ? "patient" : "staff";
    const where = await this.buildRecipientWhere(currentUserId, currentRole, hospitalId, receiverType, "", receiverId);
    if (!where) return false;

    const count = await prisma.users.count({ where });
    return count > 0;
  }

  async createRequest(data, currentUserId, hospitalId, currentRole = "director") {
    const { message, receiver_id } = data;
    if (!message) throw new Error("Message is required");

    let targetReceiver = receiver_id;

    if (!targetReceiver) {
      const superuser = await prisma.users.findFirst({
        where: {
          roles: { role_name: { in: ["superuser", "SUPERUSER", "admin", "ADMIN"] } }
        }
      });
      if (!superuser) throw new Error("No system administrator found to receive the request");
      targetReceiver = superuser.id;
    }

    if (targetReceiver === currentUserId) {
      throw new Error("You cannot send a request to yourself");
    }

    const isAllowed = await this.isAllowedRecipient(currentUserId, hospitalId, currentRole, targetReceiver);
    if (!isAllowed) {
      throw new Error("Selected recipient is not available for your role");
    }

    const created = await requestsRepository.create({
      sender_id: currentUserId,
      receiver_id: targetReceiver,
      message,
    });

    await logsRepository.create({
      user_id: currentUserId,
      action: "create_request",
      reason: `Created request to ${targetReceiver}`,
    });

    return created;
  }

  async getRequestsHistory(currentUserId) {
    // return both sent and received for the current user
    const records = await prisma.requests.findMany({
      where: {
        OR: [
          { sender_id: currentUserId },
          { receiver_id: currentUserId }
        ]
      },
      include: {
        // include basic user info
        sender: {
          select: { id: true, username: true }
        },
        // receiver relation not named; use raw include via users relation names
        receiver: {
          select: { id: true, username: true }
        }
      },
      orderBy: { created_at: "desc" }
    });

    return records;
  }
}

export default new DirectorRequestsService();
