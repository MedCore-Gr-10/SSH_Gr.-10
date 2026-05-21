import prisma from "../prisma.js";

class StaffWorkingSchedulesRepository {

  async create(data) {
    return prisma.staff_working_schedules.create({
      data
    });
  }

  async findById(id) {
    return prisma.staff_working_schedules.findUnique({
      where: { id },
      include: {
        staff_hospitals_departments: {
          include: {
            users: {
              include: {
                users_profiles: {
                  include: {
                    profiles: true
                  }
                },
                roles: true
              }
            },
            hospitals_departments: true
          }
        }
      }
    });
  }

  async findByHospital(hospitalId) {
    return prisma.staff_working_schedules.findMany({
      where: {
        hospital_id: hospitalId
      },
      include: {
        staff_hospitals_departments: {
          include: {
            users: {
              include: {
                users_profiles: {
                  include: {
                    profiles: true
                  }
                },
                roles: true
              }
            },
            hospitals_departments: true
          }
        }
      }
    });
  }

  async findStaffSchedule(staffId, hospitalId = null) {
    return prisma.staff_working_schedules.findMany({
      where: {
        staff_id: staffId,
        ...(hospitalId ? { hospital_id: hospitalId } : {}),
      },
      include: {
        staff_hospitals_departments: {
          include: {
            users: {
              include: {
                users_profiles: {
                  include: {
                    profiles: true
                  }
                },
                roles: true
              }
            },
            hospitals_departments: true
          }
        }
      }
    });
  }

  async update(id, data) {
    return prisma.staff_working_schedules.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return prisma.staff_working_schedules.delete({
      where: { id }
    });
  }

}

export default new StaffWorkingSchedulesRepository();