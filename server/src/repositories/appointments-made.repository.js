import prisma from "../prisma.js";

class AppointmentsMadeRepository {

  async create(data) {
    return prisma.appointments_made.create({
      data
    });
  }

  async findById(id) {
    return prisma.appointments_made.findUnique({
      where: { id },
      include: {
        diagnoses: true,
        prescriptions: true,
        users: true
      }
    });
  }

  async findPatientAppointments(patientId) {
    return prisma.appointments_made.findMany({
      where: {
        patient_id: patientId
      }
    });
  }

  async cancel(id) {
    return prisma.appointments_made.update({
      where: { id },
      data: {
        active_appointment_made: false
      }
    });
  }

}

export default new AppointmentsMadeRepository();