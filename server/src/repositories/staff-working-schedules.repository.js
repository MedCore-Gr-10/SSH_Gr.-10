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
            hospitals_departments: {
              include: {
                departments: true
              }
            }
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
            hospitals_departments: {
              include: {
                departments: true
              }
            }
          }
        }
      }
    });
  }

  async findActiveStaffSchedule(staffId, hospitalId) {
    return prisma.staff_working_schedules.findMany({
      where: {
        staff_id: staffId,
        hospital_id: hospitalId,
        active_schedule: true,
      },
      include: {
        staff_hospitals_departments: {
          include: {
            users: {
              include: {
                users_profiles: {
                  include: {
                    profiles: true,
                  },
                },
                roles: true,
              },
            },
            hospitals_departments: {
              include: {
                departments: true,
                hospitals: true,
              },
            },
          },
        },
      },
      orderBy: [{ day_of_week: "asc" }, { start_time: "asc" }],
    });
  }

  async findActiveHospitalSchedules(hospitalId) {
    return prisma.staff_working_schedules.findMany({
      where: {
        hospital_id: hospitalId,
        active_schedule: true,
        staff_hospitals_departments: {
          users: {
            roles: {
              role_name: {
                in: ["doctor", "nurse"],
              },
            },
          },
        },
      },
      include: {
        staff_hospitals_departments: {
          include: {
            users: {
              include: {
                users_profiles: {
                  include: {
                    profiles: true,
                  },
                },
                roles: true,
              },
            },
            hospitals_departments: {
              include: {
                departments: true,
                hospitals: true,
              },
            },
          },
        },
      },
      orderBy: [{ day_of_week: "asc" }, { start_time: "asc" }],
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
            hospitals_departments: {
              include: {
                departments: true
              }
            }
          }
        }
      }
    });
  }

  async findStaffScheduleByDay(staffId, hospitalId, dayOfWeek, excludeId = null) {
    return prisma.staff_working_schedules.findFirst({
      where: {
        staff_id: staffId,
        hospital_id: Number(hospitalId),
        day_of_week: dayOfWeek,
        ...(excludeId ? { id: { not: Number(excludeId) } } : {}),
      },
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
