import prisma from "../prisma.js";

class DiagnosesRepository {

  async create(data) {
    return prisma.diagnoses.create({
      data
    });
  }

  async findAppointmentDiagnoses(appointmentId) {
    return prisma.diagnoses.findMany({
      where: {
        appointment_made_id: appointmentId
      }
    });
  }

  async delete(id) {
    return prisma.diagnoses.delete({
      where: { id }
    });
  }

}

export default new DiagnosesRepository();