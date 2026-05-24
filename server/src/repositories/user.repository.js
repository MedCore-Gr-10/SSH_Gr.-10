import prisma from "../prisma.js";

class UsersRepository {

  /*
  |--------------------------------------------------------------------------
  | CREATE
  |--------------------------------------------------------------------------
  */

  async create(userData) {
    const { username, role_id, is_active, email, password, profile_id } = userData;

    console.log("Repository mori profile_id:", profile_id, "Tipi:", typeof profile_id);

    const parsedProfileId = typeof profile_id === 'string' && isNaN(profile_id) 
      ? profile_id 
      : parseInt(profile_id, 10); 

    if (!profile_id) {
      throw new Error("Gabim: 'profile_id' nuk erdhi në shtresën e databazës (Repository).");
    }

    return await prisma.users.create({
      data: {
        username,
        role_id: parseInt(role_id, 10),
        is_active: is_active === true || is_active === 'true',
        hash_password: password, // 🚀 FIXED: This now naturally receives the hashed string from your service layer
        salt: "SALT_VALUE",      // Keeps static salt parity with your password update logic
        users_profiles: {
          create: {
            email: email,
            profiles: {
              connect: {
                id: parsedProfileId 
              }
            }
          }
        }
      },
      include: {
        roles: true,
        users_profiles: true
      }
    });
  }
  /*
  |--------------------------------------------------------------------------
  | FIND UNIQUE
  |--------------------------------------------------------------------------
  */

  async findById(id) {
    return prisma.users.findUnique({
      where: { id },
      include: {
        roles: true,
        users_profiles: {
          include: {
            profiles: true
          }
        },
        patients_hospitals: true,
        staff_hospitals_departments: {
          include: {
            hospitals_departments: {
              include: {
                departments: true
              }
            },
            staff_specializations: {
              include: {
                specializations: true
              }
            }
          }
        }
      }
    });
  }

  async findByUsername(username) {
    return prisma.users.findUnique({
      where: { username },
      include: {
        roles: true
      }
    });
  }

  async findByEmail(email) {
    return prisma.users.findFirst({
      where: {
        users_profiles: {
          some: {
            email
          }
        }
      },
      include: {
        users_profiles: true,
        roles: true
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | FIND MANY
  |--------------------------------------------------------------------------
  */

  async findAll() {
    return prisma.users.findMany({
      include: {
        roles: true,           // Merr të dhënat e rolit (përfshirë role_name)
        users_profiles: true,  // Merr tabelën ndërmjetëse ku ndodhet emaili
        staff_hospitals_departments: {
          include: {
            hospitals_departments: {
              include: {
                hospitals: true,
                departments: true,
              },
            },
            staff_specializations: {
              include: {
                specializations: true,
              },
            },
          },
        },
      },
    });
  }

  async findDoctors() {
    return prisma.users.findMany({
      where: {
        roles: {
          role_name: {
            in: ["doctor", "DOCTOR"]
          }
        }
      },
      include: {
        roles: true,
        users_profiles: {
          include: {
            profiles: true
          }
        },
        staff_hospitals_departments: true
      }
    });
  }

  async findPatients() {
    return prisma.users.findMany({
      where: {
        roles: {
          role_name: "PATIENT"
        }
      },
      include: {
        roles: true
      }
    });
  }

  async findHospitalDoctors(hospitalId) {
    return prisma.users.findMany({
      where: {
        staff_hospitals_departments: {
          some: {
            hospital_id: hospitalId
          }
        }
      },
      include: {
        roles: true,
        staff_hospitals_departments: true
      }
    });
  }

  async findHospitalStaff(hospitalId) {
    return prisma.users.findMany({
      where: {
        staff_hospitals_departments: {
          some: {
            hospital_id: hospitalId
          }
        },
        roles: {
          role_name: {
            in: ["doctor", "DOCTOR", "nurse", "NURSE"]
          }
        }
      },
      include: {
        roles: true,
        users_profiles: {
          include: {
            profiles: true
          }
        },
        staff_hospitals_departments: {
          include: {
            hospitals_departments: {
              include: {
                departments: true
              }
            },
            staff_specializations: {
              include: {
                specializations: true
              }
            }
          }
        }
      }
    });
  }

  async findHospitalPatients(hospitalId) {
    return prisma.users.findMany({
      where: {
        patients_hospitals: {
          some: {
            hospital_id: hospitalId
          }
        },
        roles: {
          role_name: {
            in: ["patient", "PATIENT"]
          }
        }
      },
      include: {
        roles: true,
        users_profiles: {
          include: {
            profiles: true
          }
        },
        patients_hospitals: true
      }
    });
  }

  async findHospitalTenantPatients(hospitalId) {
    return prisma.users.findMany({
      where: {
        patients_hospitals: {
          some: {
            hospital_id: hospitalId,
          },
        },
      },
      include: {
        roles: true,
        users_profiles: {
          include: {
            profiles: true,
          },
        },
        patients_hospitals: {
          include: {
            hospitals: true,
          },
        },
      },
      orderBy: {
        username: "asc",
      },
    });
  }

  async searchHospitalTenantPatients(hospitalId, query) {
    const trimmed = (query || "").trim();
    if (!trimmed) {
      return [];
    }
    const terms = trimmed.split(/\s+/).filter(Boolean);

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isUuid = uuidPattern.test(trimmed);

    return prisma.users.findMany({
      where: {
        patients_hospitals: {
          some: {
            hospital_id: hospitalId,
          },
        },
        OR: [
          ...(isUuid ? [{ id: trimmed }] : []),
          {
            username: {
              contains: trimmed,
              mode: "insensitive",
            },
          },
          {
            users_profiles: {
              some: {
                OR: [
                  {
                    profiles: {
                      first_name: {
                        contains: trimmed,
                        mode: "insensitive",
                      },
                    },
                  },
                  {
                    profiles: {
                      last_name: {
                        contains: trimmed,
                        mode: "insensitive",
                      },
                    },
                  },
                  {
                    profiles: {
                      personal_no: {
                        contains: trimmed,
                        mode: "insensitive",
                      },
                    },
                  },
                ],
              },
            },
          },
          {
            users_profiles: {
              some: {
                AND: terms.map((term) => ({
                  OR: [
                    {
                      profiles: {
                        first_name: {
                          contains: term,
                          mode: "insensitive",
                        },
                      },
                    },
                    {
                      profiles: {
                        last_name: {
                          contains: term,
                          mode: "insensitive",
                        },
                      },
                    },
                    {
                      profiles: {
                        personal_no: {
                          contains: term,
                          mode: "insensitive",
                        },
                      },
                    },
                  ],
                })),
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
        patients_hospitals: {
          include: {
            hospitals: true,
          },
        },
      },
      take: 50,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE (Zgjidhja e saktë transaksionale)
  |--------------------------------------------------------------------------
  */

  async update(id, updateData) {
  const { username, role_id, is_active, email } = updateData;

  // Prisma nested write handles the transaction naturally here
  return prisma.users.update({
    where: { id },
    data: {
      ...(username !== undefined && { username }),
      ...(role_id !== undefined && { role_id }),
      ...(is_active !== undefined && { is_active }),
      // If an email is provided, target the nested relation structure
      ...(email !== undefined && {
        users_profiles: {
          updateMany: {
            where: { user_id: id },
            data: { email }
          }
        }
      })
    },
    include: {
      roles: true,
      users_profiles: true
    }
  });
}

  async activate(id) {
    return prisma.users.update({
      where: { id },
      data: {
        is_active: true
      }
    });
  }

  async deactivate(id) {
    return prisma.users.update({
      where: { id },
      data: {
        is_active: false
      }
    });
  }

  async updatePassword(id, hash_password, salt) {
    return prisma.users.update({
      where: { id },
      data: {
        hash_password,
        salt
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  async delete(id) {
    return prisma.users.delete({
      where: { id }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | ROLE
  |--------------------------------------------------------------------------
  */

  async assignRole(userId, roleId) {
    return prisma.users.update({
      where: {
        id: userId
      },
      data: {
        role_id: roleId
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | PROFILE
  |--------------------------------------------------------------------------
  */

  async attachProfile(userId, profileId, email) {
    return prisma.users_profiles.create({
      data: {
        user_id: userId,
        profile_id: profileId,
        email
      }
    });
  }

  async getProfile(userId) {
    return prisma.users_profiles.findMany({
      where: {
        user_id: userId
      },
      include: {
        profiles: true
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | HOSPITALS
  |--------------------------------------------------------------------------
  */

  async assignPatientToHospital(patientId, hospitalId) {
    return prisma.patients_hospitals.create({
      data: {
        patient_id: patientId,
        hospital_id: hospitalId
      }
    });
  }

  async getPatientHospitals(patientId) {
    return prisma.patients_hospitals.findMany({
      where: {
        patient_id: patientId
      },
      include: {
        hospitals: true
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | REQUESTS
  |--------------------------------------------------------------------------
  */

  async createRequest(data) {
    return prisma.requests.create({
      data
    });
  }

  async getSentRequests(userId) {
    return prisma.requests.findMany({
      where: {
        sender_id: userId
      }
    });
  }

  async getReceivedRequests(userId) {
    return prisma.requests.findMany({
      where: {
        receiver_id: userId
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | LOGS
  |--------------------------------------------------------------------------
  */

  async createLog(data) {
    return prisma.logs.create({
      data
    });
  }

  async getUserLogs(userId) {
    return prisma.logs.findMany({
      where: {
        user_id: userId
      },
      orderBy: {
        timestamp: "desc"
      }
    });
  }

  async getUserStatsSummary() {
  const users = await prisma.users.findMany({
    select: {
      is_active: true,
      roles: {
        select: {
          role_name: true
        }
      }
    }
  });

  // Inicializojmë objektin e statistikave sipas strukturës së front-end-it
  const summary = {
    totalUsers: users.length,
    activeUsers: 0,
    inactiveUsers: 0,
    superusers: 0,
    directors: 0,
    doctors: 0,
    nurses: 0,
    patients: 0
  };

  users.forEach(user => {
    // 1. Llogarit statuset
    if (user.is_active === true || user.is_active === 1) {
      summary.activeUsers++;
    } else {
      summary.inactiveUsers++;
    }

    // 2. Llogarit rolet (sigurohemi që i kthejmë në uppercase për krahasim të saktë)
    const role = user.roles?.role_name?.toUpperCase() || "";
    if (role === "SUPERUSER" || role === "ADMIN") summary.superusers++;
    else if (role === "DIRECTOR") summary.directors++;
    else if (role === "DOCTOR") summary.doctors++;
    else if (role === "NURSE") summary.nurses++;
    else if (role === "PATIENT") summary.patients++;
  });

  return summary;
}
}

export default new UsersRepository();
