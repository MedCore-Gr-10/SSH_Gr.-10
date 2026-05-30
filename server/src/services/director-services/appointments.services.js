import appointmentsMadeRepository from "../../repositories/appointments-made.repository.js";
import appointmentsBookingSlotsRepository from "../../repositories/appointments-booking-slots.repository.js";
import logsRepository from "../../repositories/logs.repository.js";

const getDatePart = (value) => {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().split("T")[0];
  return String(value).split("T")[0];
};

const getTimePart = (value) => {
  if (!value) return "00:00:00";
  if (value instanceof Date) return value.toISOString().slice(11, 19);
  if (String(value).includes("T")) return new Date(value).toISOString().slice(11, 19);
  return String(value).slice(0, 8);
};

const getSlotDateTime = (slot, boundary = "end") => {
  if (!slot?.appointment_date) return null;

  const template = slot.appointments_templates;
  const timeValue = boundary === "start"
    ? slot.slot_start_time || template?.start_time
    : slot.slot_end_time || template?.end_time || slot.slot_start_time || template?.start_time;
  const date = new Date(`${getDatePart(slot.appointment_date)}T${getTimePart(timeValue)}`);

  return Number.isNaN(date.getTime()) ? null : date;
};

const isSlotPast = (slot) => {
  const slotEnd = getSlotDateTime(slot, "end");
  return slotEnd ? slotEnd <= new Date() : false;
};

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

    return appointments.filter(
      (appointment) =>
        appointment.appointment_is_complete !== true &&
        !isSlotPast(appointment.appointments_booking_slots)
    );
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

    return slots.filter((slot) => !isSlotPast(slot));
  }

  async updateAppointment(id, data, hospitalId, currentUserId) {
    const appointment = await appointmentsMadeRepository.findById(Number(id));
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (appointment.appointments_booking_slots?.appointments_templates?.hospital_id !== hospitalId) {
      throw new Error("Appointment does not belong to this hospital");
    }
    if (appointment.appointment_is_complete === true) {
      throw new Error("Completed appointments cannot be edited");
    }
    if (isSlotPast(appointment.appointments_booking_slots)) {
      throw new Error("Past appointments cannot be edited");
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
      if (isSlotPast(slot)) {
        throw new Error("Selected appointment slot is in the past");
      }
      const slotIsBooked = slot.appointments_made?.some(
        (bookedAppointment) => bookedAppointment.id !== Number(id)
      );
      if (slotIsBooked) {
        throw new Error("Selected appointment slot is already booked");
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
    if (appointment.appointment_is_complete === true) {
      throw new Error("Completed appointments cannot be canceled");
    }
    if (isSlotPast(appointment.appointments_booking_slots)) {
      throw new Error("Past appointments cannot be canceled");
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
