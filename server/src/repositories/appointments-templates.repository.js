import prisma from "../prisma.js";

class AppointmentsTemplatesRepository {
  async create(data) {
    return prisma.appointments_templates.create({ data });
  }

  async findById(id) {
    return prisma.appointments_templates.findUnique({
      where: { id },
      include: { staff_hospitals_departments: true }
    });
  }

  async findByHospital(hospitalId) {
    return prisma.appointments_templates.findMany({
      where: { hospital_id: hospitalId },
      include: {
        staff_hospitals_departments: {
          include: { users: { include: { users_profiles: { include: { profiles: true } }, roles: true } } }
        }
      },
      orderBy: { day_of_week: 'asc' }
    });
  }

  async update(id, data) {
    return prisma.appointments_templates.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.appointments_templates.delete({ where: { id } });
  }
}

export default new AppointmentsTemplatesRepository();
