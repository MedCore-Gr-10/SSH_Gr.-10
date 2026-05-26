import prisma from "../prisma.js";

class ProfilesRepository {
  async create(data) {
    return prisma.profiles.create({
      data
    });
  }

  async findById(id) {
    return prisma.profiles.findUnique({
      where: { id },
      include: {
        users_profiles: {
          include: {
            users: {
              include: {
                roles: true
              }
            }
          }
        }
      }
    });
  }

  async findByPersonalNo(personal_no) {
    return prisma.profiles.findUnique({
      where: {
        personal_no
      }
    });
  }

  async findByPhoneNumber(phone_number) {
    return prisma.profiles.findFirst({
      where: {
        phone_number
      }
    });
  }

  async findAll() {
    return prisma.profiles.findMany({
      include: {
        users_profiles: {
          include: {
            users: {
              include: {
                roles: true
              }
            }
          }
        }
      }
    });
  }

  async searchByName(search) {
    return prisma.profiles.findMany({
      where: {
        OR: [
          {
            first_name: {
              contains: search,
              mode: "insensitive"
            }
          },
          {
            last_name: {
              contains: search,
              mode: "insensitive"
            }
          }
        ]
      }
    });
  }

  async update(id, data) {
    return prisma.profiles.update({
      where: { id },
      data
    });
  }

  async updatePhoneNumber(id, phone_number) {
    return prisma.profiles.update({
      where: { id },
      data: {
        phone_number
      }
    });
  }


  async delete(id) {
    return prisma.profiles.delete({
      where: { id }
    });
  }

  async attachUser(profileId, userId, email) {
    return prisma.users_profiles.create({
      data: {
        profile_id: profileId,
        user_id: userId,
        email
      }
    });
  }

  async detachUser(profileId, userId) {
    return prisma.users_profiles.delete({
      where: {
        user_id_profile_id: {
          user_id: userId,
          profile_id: profileId
        }
      }
    });
  }

  async getUsers(profileId) {
    return prisma.users_profiles.findMany({
      where: {
        profile_id: profileId
      },
      include: {
        users: {
          include: {
            roles: true
          }
        }
      }
    });
  }

  async findUserProfile(userId) {
    return prisma.users_profiles.findFirst({
      where: {
        user_id: userId
      },
      include: {
        profiles: {
          include: {
            current_emergency_contact: true
          }
        }
      }
    });
  }

  async updateCurrentEmergencyContact(profileId, contactId) {
    return prisma.profiles.update({
      where: {
        id: profileId
      },
      data: {
        current_emergency_contact_id: contactId
      }
    });
  }


  async getPatientFullProfile(userId) {
    return prisma.users.findUnique({
      where: {
        id: userId
      },
      include: {
        roles: true,
        users_profiles: {
          include: {
            profiles: true
          }
        },
        allergies: true,
        insurance: true,
        emergency_contacts: true,
        patients_hospitals: {
          include: {
            hospitals: true
          }
        },
        appointments_made: {
          include: {
            appointments_booking_slots: true,
            diagnoses: true,
            prescriptions: true
          }
        }
      }
    });
  }


  async getDoctorFullProfile(userId) {
    return prisma.users.findUnique({
      where: {
        id: userId
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
                hospitals: true,
                departments: true
              }
            },
            staff_specializations: {
              include: {
                specializations: true
              }
            },
            staff_working_schedules: true,
            appointments_templates: true
          }
        },
        reviews_reviews_doctor_idTousers: true
      }
    });
  }


  async findDirectorByPersonalNo(personalNo) {
    return prisma.profiles.findFirst({
      where: {
        personal_no: String(personalNo),
        users_profiles: {
          some: {
            users: {
              roles: {
                role_name: "director"
              }
            }
          }
        }
      },
      include: {
        users_profiles: {
          include: {
            users: {
              select: {
                id: true,
                username: true,
                is_active: true,
                role_id: true
              }
            }
          }
        }
      }
    });
  }
}

export default new ProfilesRepository();
