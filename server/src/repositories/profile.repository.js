import prisma from "../prisma.js";

class ProfilesRepository {

  /*
  |--------------------------------------------------------------------------
  | CREATE
  |--------------------------------------------------------------------------
  */

  async create(data) {
    return prisma.profiles.create({
      data
    });
  }

  /*
  |--------------------------------------------------------------------------
  | FIND UNIQUE
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | FIND MANY
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | UPDATE
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  /*
  |--------------------------------------------------------------------------
  | USER RELATIONS
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | PATIENT DETAILS
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | DOCTOR DETAILS
  |--------------------------------------------------------------------------
  */

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
async delete(id) {
  return await prisma.profile.delete({
    where: { 
      id: parseInt(id, 10) 
    }
  });
}
}


export default new ProfilesRepository();