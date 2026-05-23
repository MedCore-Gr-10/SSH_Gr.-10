import requestsRepository from "../../repositories/requests.repository.js";
import logsRepository from "../../repositories/logs.repository.js";
import prisma from "../../prisma.js";

class DirectorRequestsService {
  formatRecipient(user) {
    const profile = user.users_profiles?.[0];
    const fullName = `${profile?.profiles?.first_name || ""} ${profile?.profiles?.last_name || ""}`.trim();

    return {
      id: user.id,
      username: user.username,
      role: user.roles?.role_name || null,
      email: profile?.email || null,
      name: fullName || user.username,
    };
  }

  async getRequestRecipients(currentUserId, hospitalId) {
    const users = await prisma.users.findMany({
      where: {
        id: {
          not: currentUserId,
        },
        OR: [
          {
            roles: {
              role_name: {
                in: ["superuser", "SUPERUSER"],
              },
            },
          },
          {
            staff_hospitals_departments: {
              some: {
                hospital_id: hospitalId,
              },
            },
          },
          {
            patients_hospitals: {
              some: {
                hospital_id: hospitalId,
              },
            },
          },
        ],
      },
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
    });

    return users.map((user) => this.formatRecipient(user));
  }

  async createRequest(data, currentUserId, hospitalId) {
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

    const allowedRecipients = await this.getRequestRecipients(currentUserId, hospitalId);
    const isAllowedRecipient = allowedRecipients.some((recipient) => recipient.id === targetReceiver);
    if (!isAllowedRecipient) {
      throw new Error("Selected recipient is not available for your hospital");
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
