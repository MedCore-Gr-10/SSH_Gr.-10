import appointmentsMadeRepository from "../../repositories/appointments-made.repository.js";
import appointmentsBookingSlotsRepository from "../../repositories/appointments-booking-slots.repository.js";
import logsRepository from "../../repositories/logs.repository.js";

class DirectorAppointmentsService {
  async getHospitalAppointments(hospitalId, currentUserId) {
    if (!hospitalId) {
      throw new Error("Hospital ID is required to list appointments");
    }

    const appointments = await appointmentsMadeRepository.findHospitalAppointments(hospitalId);

    await logsRepository.create({
      user_id: currentUserId,
      action: "view appointments",
      reason: "Director viewed all hospital appointments",
    });

    return appointments;
  }

  async getHospitalSlots(hospitalId, currentUserId) {
    if (!hospitalId) {
      throw new Error("Hospital ID is required to list appointment slots");
    }

    const slots = await appointmentsBookingSlotsRepository.findHospitalSlots(hospitalId);

    await logsRepository.create({
      user_id: currentUserId,
      action: "view appointment slots",
      reason: "Director viewed appointment slots",
    });

    return slots;
  }

  async updateAppointment(id, data, hospitalId, currentUserId) {
    const appointment = await appointmentsMadeRepository.findById(Number(id));
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (appointment.appointments_booking_slots?.appointments_templates?.hospital_id !== hospitalId) {
      throw new Error("Appointment does not belong to this hospital");
    }

    const updateData = {};
    if (data.appointment_booking_slot_id) {
      const slot = await appointmentsBookingSlotsRepository.findById(Number(data.appointment_booking_slot_id));
      if (!slot) {
        throw new Error("Selected appointment slot not found");
      }
      if (slot.appointments_templates?.hospital_id !== hospitalId) {
        throw new Error("Selected slot does not belong to this hospital");
      }
      updateData.appointment_booking_slot_id = Number(data.appointment_booking_slot_id);
    }
    if (typeof data.appointment_is_complete !== "undefined") {
      updateData.appointment_is_complete = data.appointment_is_complete;
    }

    const updated = await appointmentsMadeRepository.update(Number(id), updateData);

    await logsRepository.create({
      user_id: currentUserId,
      action: "update appointment",
      reason: "Director rescheduled or updated an appointment",
    });

    return updated;
  }

  async deleteAppointment(id, hospitalId, currentUserId) {
    const appointment = await appointmentsMadeRepository.findById(Number(id));
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (appointment.appointments_booking_slots?.appointments_templates?.hospital_id !== hospitalId) {
      throw new Error("Appointment does not belong to this hospital");
    }

    await appointmentsMadeRepository.cancel(Number(id));

    await logsRepository.create({
      user_id: currentUserId,
      action: "cancel appointment",
      reason: "Director canceled an appointment",
    });

    return { id };
  }
}

export default new DirectorAppointmentsService();
