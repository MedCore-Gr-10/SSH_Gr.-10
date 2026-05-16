import prisma from "../prisma.js";

class PrescriptionsRepository {

  async create(data) {
    return prisma.prescriptions.create({
      data
    });
  }

  async findAppointmentPrescriptions(appointmentId) {
    return prisma.prescriptions.findMany({
      where: {
        appointment_made_id: appointmentId
      }
    });
  }

  async update(id, data) {
    return prisma.prescriptions.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return prisma.prescriptions.delete({
      where: { id }
    });
  }

}

export default new PrescriptionsRepository();