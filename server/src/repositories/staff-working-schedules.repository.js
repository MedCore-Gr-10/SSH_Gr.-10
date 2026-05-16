import prisma from "../prisma.js";

class StaffWorkingSchedulesRepository {

  async create(data) {
    return prisma.staff_working_schedules.create({
      data
    });
  }

  async findStaffSchedule(staffId) {
    return prisma.staff_working_schedules.findMany({
      where: {
        staff_id: staffId
      }
    });
  }

  async update(id, data) {
    return prisma.staff_working_schedules.update({
      where: { id },
      data
    });
  }

}

export default new StaffWorkingSchedulesRepository();