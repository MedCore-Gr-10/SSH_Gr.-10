import prisma from "../prisma.js";

class AppointmentsBookingSlotsRepository {

  async create(data) {
    return prisma.appointments_booking_slots.create({
      data
    });
  }

  async findById(id) {
    return prisma.appointments_booking_slots.findUnique({
      where: { id },
      include: {
        users: true,
        appointments_templates: true
      }
    });
  }

  async findDoctorSlots(doctorId) {
    return prisma.appointments_booking_slots.findMany({
      where: {
        doctor_id: doctorId
      }
    });
  }

  async findAvailableSlots(date) {
    return prisma.appointments_booking_slots.findMany({
      where: {
        appointment_date: date,
        active_appointment_booking_slot: true
      }
    });
  }

  async update(id, data) {
    return prisma.appointments_booking_slots.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return prisma.appointments_booking_slots.delete({
      where: { id }
    });
  }

}

export default new AppointmentsBookingSlotsRepository();