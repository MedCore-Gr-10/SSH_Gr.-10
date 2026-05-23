import appointmentsBookingSlotsRepository from "../repositories/appointmentsBookingSlotsRepository.js";

class AppointmentsBookingSlotsService {

  /*
  |--------------------------------------------------------------------------
  | CREATE SLOT (MAIN LOGIC)
  |--------------------------------------------------------------------------
  | Doctor creates a slot inside template boundaries
  */
  async createSlot({ doctorId, date, start_time, end_time }) {

    // 1. Get day of week from date
    const dayOfWeek = this.getDayOfWeek(date);

    // 2. Get template for doctor + day
    const template =
      await appointmentsBookingSlotsRepository.findTemplateByDoctorAndDay(
        doctorId,
        dayOfWeek
      );

    if (!template) {
      throw new Error("No working template found for this day");
    }

    // 3. Validate inside template bounds
    if (
      this.timeToMinutes(start_time) < this.timeToMinutes(template.start_time) ||
      this.timeToMinutes(end_time) > this.timeToMinutes(template.end_time)
    ) {
      throw new Error("Slot is outside working hours");
    }

    if (this.timeToMinutes(start_time) >= this.timeToMinutes(end_time)) {
      throw new Error("Invalid time range");
    }

    // 4. Get existing slots for overlap check
    const existingSlots =
      await appointmentsBookingSlotsRepository.findDoctorSlotsByDate(
        doctorId,
        date
      );

    // 5. OVERLAP CHECK (CORE LOGIC)
    for (const slot of existingSlots) {
      if (this.isOverlap(start_time, end_time, slot.start_time, slot.end_time)) {
        throw new Error("Slot overlaps with existing appointment slot");
      }
    }

    // 6. CREATE SLOT
    return appointmentsBookingSlotsRepository.create({
      doctor_id: doctorId,
      appointment_date: date,
      start_time,
      end_time,
      active_appointment_booking_slot: true
    });
  }

  /*
  |--------------------------------------------------------------------------
  | GET DOCTOR SLOTS
  |--------------------------------------------------------------------------
  */
  async getDoctorSlots(doctorId, date = null) {
    return appointmentsBookingSlotsRepository.findDoctorSlots(
      doctorId,
      date
    );
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE SLOT (SOFT DELETE)
  |--------------------------------------------------------------------------
  */
  async deleteSlot(slotId) {
    return appointmentsBookingSlotsRepository.deactivate(slotId);
  }

  /*
  |--------------------------------------------------------------------------
  | OVERLAP CHECK LOGIC
  |--------------------------------------------------------------------------
  */
  isOverlap(startA, endA, startB, endB) {
    const aStart = this.timeToMinutes(startA);
    const aEnd = this.timeToMinutes(endA);
    const bStart = this.timeToMinutes(startB);
    const bEnd = this.timeToMinutes(endB);

    return aStart < bEnd && aEnd > bStart;
  }

  /*
  |--------------------------------------------------------------------------
  | TIME CONVERSION HELPER
  |--------------------------------------------------------------------------
  */
  timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  /*
  |--------------------------------------------------------------------------
  | DATE → DAY OF WEEK
  |--------------------------------------------------------------------------
  */
  getDayOfWeek(date) {
    return new Date(date)
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
  }
}

export default new AppointmentsBookingSlotsService();