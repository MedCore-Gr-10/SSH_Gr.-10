import appointmentsTemplatesRepository from "../../repositories/appointments-templates.repository.js";
import appointmentsBookingSlotsRepository from "../../repositories/appointments-booking-slots.repository.js";
import logsRepository from "../../repositories/logs.repository.js";

/**
 * Appointment Slot Generator Service
 * Automatically generates booking slots from recurring templates
 * 
 * This service handles:
 * - Converting weekly recurring templates to actual dated booking slots
 * - Preventing duplicate slot generation
 * - Handling weekly auto-generation
 */
class AppointmentSlotGeneratorService {

  /**
   * Get day of week from date (0=Sunday, 1=Monday, etc)
   * @param {Date} date - Date to check
   * @returns {string} Day name
   */
  #getDayOfWeek(date) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
  }

  #toDateOnly(date) {
    return new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      12,
      0,
      0,
      0
    ));
  }

  /**
   * Get next 7 days from a start date
   * @param {Date} startDate - Start date
   * @returns {Array<Date>} Array of 7 dates
   */
  #getNext7Days(startDate) {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }

  /**
   * Combine time components into a full DateTime
   * @param {Date} date - The date part
   * @param {DateTime} timeOfDay - The time part (ISO time string)
   * @returns {DateTime} Combined DateTime
   */
  #combineDateTime(date, timeOfDay) {
    const timeStr = new Date(timeOfDay).toISOString().split('T')[1];
    const dateStr = date.toISOString().split('T')[0];
    return new Date(`${dateStr}T${timeStr}`);
  }

  /**
   * Generate booking slots for a doctor for the next 7 days
   * Call this every Monday at 00:00 to generate slots for the week
   * 
   * @param {string} doctorId - Doctor's UUID
   * @param {Date} startDate - Start date (optional, defaults to today)
   * @param {string} currentUserId - User ID for logging
   * @returns {Promise<Object>} { created: number, skipped: number, duplicates: number }
   * @throws {Error} If doctor has no templates
   */
  async generateWeeklySlots(doctorId, startDate = null, currentUserId = null) {
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    // Get next 7 days
    const next7Days = this.#getNext7Days(start);

    // Get all active templates for this doctor
    const templates = await appointmentsTemplatesRepository.findByStaffId(doctorId);

    if (templates.length === 0) {
      throw new Error("Doctor has no recurring appointment templates");
    }

    const slotsToCreate = [];
    let totalToCreate = 0;

    // For each day in the next 7 days
    for (const date of next7Days) {
      const dayOfWeek = this.#getDayOfWeek(date);

      // Find templates for this day
      const dayTemplates = templates.filter(t => t.day_of_week === dayOfWeek);

      // For each template on this day, create a slot
      for (const template of dayTemplates) {
        // Check for duplicate
        const duplicate = await appointmentsBookingSlotsRepository.findDuplicate(
          doctorId,
          this.#toDateOnly(date),
          template.start_time,
          template.end_time
        );

        if (!duplicate) {
          slotsToCreate.push({
            doctor_id: doctorId,
            appointment_template_id: template.id,
            appointment_date: this.#toDateOnly(date),
            slot_start_time: template.start_time,
            slot_end_time: template.end_time,
            active_appointment_booking_slot: true
          });
          totalToCreate++;
        }
      }
    }

    // Bulk create slots
    if (slotsToCreate.length > 0) {
      const result = await appointmentsBookingSlotsRepository.createBulk(slotsToCreate);

      if (currentUserId) {
        await logsRepository.create({
          user_id: currentUserId,
          action: "generate appointment slots",
          reason: `Generated ${result.count} slots for doctor ${doctorId}`
        });
      }

      return {
        created: result.count,
        total_attempted: totalToCreate,
        duplicates_skipped: totalToCreate - result.count
      };
    }

    return { created: 0, total_attempted: 0, duplicates_skipped: 0 };
  }

  /**
   * Generate slots for a specific date range
   * @param {string} doctorId - Doctor's UUID
   * @param {Date} fromDate - Start date
   * @param {Date} toDate - End date (inclusive)
   * @param {string} currentUserId - User ID for logging
   * @returns {Promise<Object>} Generation result
   * @throws {Error} If invalid date range or no templates
   */
  async generateSlotsForDateRange(doctorId, fromDate, toDate, currentUserId = null) {
    if (fromDate > toDate) {
      throw new Error("From date must be before to date");
    }

    // Get templates
    const templates = await appointmentsTemplatesRepository.findByStaffId(doctorId);
    if (templates.length === 0) {
      throw new Error("Doctor has no recurring appointment templates");
    }

    const slotsToCreate = [];
    const currentDate = new Date(fromDate);
    currentDate.setHours(0, 0, 0, 0);

    // Iterate through date range
    while (currentDate <= toDate) {
      const dayOfWeek = this.#getDayOfWeek(currentDate);
      const dayTemplates = templates.filter(t => t.day_of_week === dayOfWeek);

      for (const template of dayTemplates) {
        // Check for duplicate
        const duplicate = await appointmentsBookingSlotsRepository.findDuplicate(
          doctorId,
          this.#toDateOnly(currentDate),
          template.start_time,
          template.end_time
        );

        if (!duplicate) {
          slotsToCreate.push({
            doctor_id: doctorId,
            appointment_template_id: template.id,
            appointment_date: this.#toDateOnly(currentDate),
            slot_start_time: template.start_time,
            slot_end_time: template.end_time,
            active_appointment_booking_slot: true
          });
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Bulk create
    if (slotsToCreate.length > 0) {
      const result = await appointmentsBookingSlotsRepository.createBulk(slotsToCreate);

      if (currentUserId) {
        await logsRepository.create({
          user_id: currentUserId,
          action: "generate appointment slots for date range",
          reason: `Generated ${result.count} slots from ${fromDate} to ${toDate}`
        });
      }

      return {
        created: result.count,
        total_attempted: slotsToCreate.length,
        duplicates_skipped: slotsToCreate.length - result.count
      };
    }

    return { created: 0, total_attempted: 0, duplicates_skipped: 0 };
  }

  /**
   * Generate slots for a specific template
   * Useful for manual testing or after template creation
   * @param {number} templateId - Template ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {string} currentUserId - User ID for logging
   * @returns {Promise<Object>} Generation result
   * @throws {Error} If template not found
   */
  async generateSlotsForTemplate(templateId, startDate, endDate, currentUserId = null) {
    const template = await appointmentsTemplatesRepository.findById(templateId);

    if (!template) {
      throw new Error("Template not found");
    }

    const slotsToCreate = [];
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    // Only create slots for dates that match the template's day of week
    while (currentDate <= endDate) {
      const dayOfWeek = this.#getDayOfWeek(currentDate);

      if (dayOfWeek === template.day_of_week) {
        // Check for duplicate
        const duplicate = await appointmentsBookingSlotsRepository.findDuplicate(
          template.staff_id,
          this.#toDateOnly(currentDate),
          template.start_time,
          template.end_time
        );

        if (!duplicate) {
          slotsToCreate.push({
            doctor_id: template.staff_id,
            appointment_template_id: templateId,
            appointment_date: this.#toDateOnly(currentDate),
            slot_start_time: template.start_time,
            slot_end_time: template.end_time,
            active_appointment_booking_slot: true
          });
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Bulk create
    if (slotsToCreate.length > 0) {
      const result = await appointmentsBookingSlotsRepository.createBulk(slotsToCreate);

      if (currentUserId) {
        await logsRepository.create({
          user_id: currentUserId,
          action: "generate slots for template",
          reason: `Generated ${result.count} slots for template ${templateId}`
        });
      }

      return {
        created: result.count,
        total_attempted: slotsToCreate.length,
        duplicates_skipped: slotsToCreate.length - result.count
      };
    }

    return { created: 0, total_attempted: 0, duplicates_skipped: 0 };
  }

  /**
   * Regenerate slots for next 4 weeks (useful for correcting past generation)
   * @param {string} doctorId - Doctor's UUID
   * @param {string} currentUserId - User ID for logging
   * @returns {Promise<Object>} Generation result
   */
  async regenerateNext4Weeks(doctorId, currentUserId = null) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fourWeeksLater = new Date(today);
    fourWeeksLater.setDate(today.getDate() + 28);

    return this.generateSlotsForDateRange(doctorId, today, fourWeeksLater, currentUserId);
  }

  /**
   * Get generation status for a doctor
   * @param {string} doctorId - Doctor's UUID
   * @returns {Promise<Object>} Status information
   */
  async getGenerationStatus(doctorId) {
    const templates = await appointmentsTemplatesRepository.findByStaffId(doctorId);
    const latestSlotDate = await appointmentsBookingSlotsRepository.findLatestSlotDate(doctorId);
    const totalSlots = await appointmentsBookingSlotsRepository.countDoctorSlots(doctorId);
    const availableSlots = await appointmentsBookingSlotsRepository.countAvailableDoctorSlots(doctorId);

    return {
      has_templates: templates.length > 0,
      template_count: templates.length,
      latest_slot_date: latestSlotDate,
      total_slots: totalSlots,
      available_slots: availableSlots,
      booked_slots: totalSlots - availableSlots,
      needs_generation: !latestSlotDate || this.#isGenerationNeeded(latestSlotDate)
    };
  }

  /**
   * Helper: Check if slot generation is needed
   * @param {Date} latestSlotDate - Latest generated slot date
   * @returns {boolean} True if generation needed
   */
  #isGenerationNeeded(latestSlotDate) {
    if (!latestSlotDate) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastDate = new Date(latestSlotDate);
    lastDate.setHours(0, 0, 0, 0);

    // If latest slot is less than 3 days away, generation is needed
    const daysUntilLastSlot = Math.ceil((lastDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilLastSlot <= 3;
  }

  /**
   * Find all doctors needing slot generation
   * @returns {Promise<Array>} Array of doctor IDs
   */
  async findDoctorsNeedingGeneration() {
    // Get all doctors with templates
    const templates = await appointmentsTemplatesRepository.findByStaffId("*"); // This won't work, need different approach
    
    // For now, return empty - this would be implemented with a query
    // to find doctors whose latest slots are expiring soon
    return [];
  }
}

export default new AppointmentSlotGeneratorService();
