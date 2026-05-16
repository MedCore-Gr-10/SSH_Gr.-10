import prisma from "../prisma.js";

class UsersRepository {

  /*
  |--------------------------------------------------------------------------
  | CREATE
  |--------------------------------------------------------------------------
  */

  async create(data) {
    return prisma.users.create({
      data
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
        roles: true
      }
    });
  }

  async findDoctors() {
    return prisma.users.findMany({
      where: {
        roles: {
          role_name: "DOCTOR"
        }
      },
      include: {
        roles: true,
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

  /*
  |--------------------------------------------------------------------------
  | UPDATE
  |--------------------------------------------------------------------------
  */

  async update(id, data) {
    return prisma.users.update({
      where: { id },
      data
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

}


export default new UsersRepository();