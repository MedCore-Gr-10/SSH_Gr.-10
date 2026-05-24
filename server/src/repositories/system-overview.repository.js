import prisma from "../prisma.js";

class SystemOverviewRepository {
  async countPatients(hospitalId) {
    return prisma.patients_hospitals.count({
      where: { hospital_id: hospitalId },
    });
  }

  async countStaff(hospitalId) {
    const staffGroups = await prisma.staff_hospitals_departments.groupBy({
      by: ["staff_id"],
      where: { hospital_id: hospitalId },
    });

    return staffGroups.length;
  }

  async countAppointments(hospitalId) {
    return prisma.appointments_made.count({
      where: {
        appointments_booking_slots: {
          appointments_templates: {
            hospital_id: hospitalId,
          },
        },
      },
    });
  }

  async countActiveAppointments(hospitalId) {
    return prisma.appointments_made.count({
      where: {
        appointment_is_complete: false,
        appointments_booking_slots: {
          appointments_templates: {
            hospital_id: hospitalId,
          },
        },
      },
    });
  }

  async countCompletedAppointments(hospitalId) {
    return prisma.appointments_made.count({
      where: {
        appointment_is_complete: true,
        appointments_booking_slots: {
          appointments_templates: {
            hospital_id: hospitalId,
          },
        },
      },
    });
  }

  async countActiveSchedules(hospitalId) {
    return prisma.staff_working_schedules.count({
      where: {
        hospital_id: hospitalId,
        active_schedule: true,
      },
    });
  }

  async findHospitalLogs(hospitalId, limit = 10) {
    return prisma.logs.findMany({
      where: {
        user: {
          OR: [
            {
              staff_hospitals_departments: {
                some: { hospital_id: hospitalId },
              },
            },
            {
              patients_hospitals: {
                some: { hospital_id: hospitalId },
              },
            },
          ],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            users_profiles: {
              select: {
                profiles: true,
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
    });
  }
}

export default new SystemOverviewRepository();
