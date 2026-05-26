import appointmentsBookingSlotsRepository from "../repositories/appointmentsBookingSlotsRepository.js";

class AppointmentsBookingSlotsService {

  async createSlot({ doctorId, date, start_time, end_time }) {

    const dayOfWeek = this.getDayOfWeek(date);

    const template =
      await appointmentsBookingSlotsRepository.findTemplateByDoctorAndDay(
        doctorId,
        dayOfWeek
      );

    if (!template) {
      throw new Error("No working template found for this day");
    }

    if (
      this.timeToMinutes(start_time) < this.timeToMinutes(template.start_time) ||
      this.timeToMinutes(end_time) > this.timeToMinutes(template.end_time)
    ) {
      throw new Error("Slot is outside working hours");
    }

    if (this.timeToMinutes(start_time) >= this.timeToMinutes(end_time)) {
      throw new Error("Invalid time range");
    }

    const existingSlots =
      await appointmentsBookingSlotsRepository.findDoctorSlotsByDate(
        doctorId,
        date
      );

    for (const slot of existingSlots) {
      if (this.isOverlap(start_time, end_time, slot.start_time, slot.end_time)) {
        throw new Error("Slot overlaps with existing appointment slot");
      }
    }

    return appointmentsBookingSlotsRepository.create({
      doctor_id: doctorId,
      appointment_date: date,
      start_time,
      end_time,
      active_appointment_booking_slot: true
    });
  }

  async getDoctorSlots(doctorId, date = null) {
    return appointmentsBookingSlotsRepository.findDoctorSlots(
      doctorId,
      date
    );
  }

  async deleteSlot(slotId) {
    return appointmentsBookingSlotsRepository.deactivate(slotId);
  }

  isOverlap(startA, endA, startB, endB) {
    const aStart = this.timeToMinutes(startA);
    const aEnd = this.timeToMinutes(endA);
    const bStart = this.timeToMinutes(startB);
    const bEnd = this.timeToMinutes(endB);

    return aStart < bEnd && aEnd > bStart;
  }

 
  timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  getDayOfWeek(date) {
    return new Date(date)
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
  }
}

export default new AppointmentsBookingSlotsService();