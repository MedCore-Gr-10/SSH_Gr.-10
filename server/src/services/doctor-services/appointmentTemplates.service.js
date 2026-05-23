import appointmentsTemplatesRepository from "../../repositories/appointments-templates.repository.js";
import appointmentsBookingSlotsRepository from "../../repositories/appointments-booking-slots.repository.js";
import staffWorkingSchedulesRepository from "../../repositories/staff-working-schedules.repository.js";
import logsRepository from "../../repositories/logs.repository.js";
import prisma from "../../prisma.js";

/**
 * Doctor Appointment Templates Service
 * Handles recurring template management with validation against staff schedules
 */
class DoctorAppointmentTemplatesService {
  
  /**
   * Helper: Normalize time to ISO format
   * @param {string} value - Time string (HH:MM or HH:MM:SS)
   * @returns {string} ISO time string
   */
  #normalizeTime(value) {
    if (!value) return null;
    let hour = 0;
    let minute = 0;
    let second = 0;

    if (/^\d{1,2}:\d{2}$/.test(value)) {
      [hour, minute] = value.split(":").map(Number);
    } else if (/^\d{1,2}:\d{2}:\d{2}$/.test(value)) {
      [hour, minute, second] = value.split(":").map(Number);
    } else {
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        throw new Error("Invalid time format. Use HH:MM or HH:MM:SS");
      }
      hour = parsed.getUTCHours();
      minute = parsed.getUTCMinutes();
      second = parsed.getUTCSeconds();
    }

    const isoString = new Date(Date.UTC(1970, 0, 1, hour, minute, second)).toISOString();
    return isoString;
  }

  /**
   * Helper: Compare times
   * @param {DateTime} time1 - Time 1
   * @param {DateTime} time2 - Time 2
   * @returns {number} -1 if time1 < time2, 0 if equal, 1 if time1 > time2
   */
  #compareTime(time1, time2) {
    const t1 = new Date(time1).getTime();
    const t2 = new Date(time2).getTime();
    if (t1 < t2) return -1;
    if (t1 > t2) return 1;
    return 0;
  }

  /**
   * Helper: Check if time range is within working schedule
   * @param {Object} workingSchedule - Staff's working schedule for day
   * @param {DateTime} startTime - Template start time
   * @param {DateTime} endTime - Template end time
   * @throws {Error} If template falls outside working schedule
   */
  #validateTimeWithinWorkingSchedule(workingSchedule, startTime, endTime) {
    if (!workingSchedule) {
      throw new Error("No working schedule found for this day");
    }

    // Check if template times are within working hours
    const startWithinSchedule = this.#compareTime(startTime, workingSchedule.start_time) >= 0 &&
                                this.#compareTime(startTime, workingSchedule.end_time) < 0;
    const endWithinSchedule = this.#compareTime(endTime, workingSchedule.start_time) > 0 &&
                              this.#compareTime(endTime, workingSchedule.end_time) <= 0;

    if (!startWithinSchedule || !endWithinSchedule) {
      throw new Error(
        `Template times must be within working schedule ` +
        `(${workingSchedule.start_time} - ${workingSchedule.end_time})`
      );
    }
  }

  /**
   * Helper: Check for time overlaps
   * @param {Array} existingTemplates - Existing templates for the day
   * @param {DateTime} startTime - New template start time
   * @param {DateTime} endTime - New template end time
   * @throws {Error} If overlap detected
   */
  #validateNoOverlap(existingTemplates, startTime, endTime) {
    const newStart = new Date(startTime).getTime();
    const newEnd = new Date(endTime).getTime();

    for (const template of existingTemplates) {
      const existStart = new Date(template.start_time).getTime();
      const existEnd = new Date(template.end_time).getTime();

      // Check for overlap
      if ((newStart < existEnd) && (newEnd > existStart)) {
        throw new Error(
          `Time slot overlaps with existing template ` +
          `(${template.start_time} - ${template.end_time})`
        );
      }
    }
  }

  async getDoctorAssignments(doctorId, hospitalId) {
    const assignments = await prisma.staff_hospitals_departments.findMany({
      where: {
        staff_id: doctorId,
        hospital_id: hospitalId,
      },
      include: {
        hospitals_departments: {
          include: {
            departments: true,
          },
        },
      },
      orderBy: {
        department_id: "asc",
      },
    });

    return assignments.map((assignment) => ({
      hospital_id: assignment.hospital_id,
      department_id: assignment.department_id,
      department_name:
        assignment.hospitals_departments?.departments?.department_name ||
        `Department #${assignment.department_id}`,
    }));
  }

  async #resolveDepartmentId(doctorId, hospitalId, departmentId) {
    if (departmentId) return departmentId;

    const assignments = await this.getDoctorAssignments(doctorId, hospitalId);
    if (assignments.length === 0) {
      throw new Error("Doctor is not assigned to a department in this hospital");
    }

    if (assignments.length > 1) {
      throw new Error("Choose a department for this appointment template");
    }

    return assignments[0].department_id;
  }

  /**
   * Create a new recurring appointment template
   * @param {Object} data - { day_of_week, start_time, end_time }
   * @param {string} doctorId - Doctor's UUID
   * @param {number} hospitalId - Hospital ID
   * @param {number} departmentId - Department ID
   * @param {string} currentUserId - Current user ID (for logging)
   * @returns {Promise<Object>} Created template
   * @throws {Error} If validation fails
   */
  async createTemplate(data, doctorId, hospitalId, departmentId, currentUserId) {
    const { day_of_week, start_time, end_time } = data;

    // Validate input
    if (!day_of_week || !start_time || !end_time) {
      throw new Error("day_of_week, start_time, and end_time are required");
    }

    const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    if (!validDays.includes(day_of_week)) {
      throw new Error(`Invalid day_of_week. Must be one of: ${validDays.join(", ")}`);
    }

    const resolvedDepartmentId = await this.#resolveDepartmentId(
      doctorId,
      hospitalId,
      departmentId
    );

    // Validate doctor is assigned to hospital/department
    const assignment = await prisma.staff_hospitals_departments.findUnique({
      where: {
        staff_id_hospital_id_department_id: {
          staff_id: doctorId,
          hospital_id: hospitalId,
          department_id: resolvedDepartmentId
        }
      }
    });

    if (!assignment) {
      throw new Error("Doctor not assigned to this hospital/department");
    }

    // Normalize times
    const normalizedStart = this.#normalizeTime(start_time);
    const normalizedEnd = this.#normalizeTime(end_time);

    // Validate start < end
    if (this.#compareTime(normalizedStart, normalizedEnd) >= 0) {
      throw new Error("Start time must be before end time");
    }

    // Fetch doctor's working schedule for the day
    const workingSchedules = await staffWorkingSchedulesRepository.findByHospital(hospitalId);
    const daySchedules = workingSchedules.filter(
      s => s.staff_id === doctorId && s.day_of_week === day_of_week
    );

    if (daySchedules.length === 0) {
      throw new Error(`No working schedule found for ${day_of_week}`);
    }

    const daySchedule = daySchedules[0];

    // Validate template is within working hours
    this.#validateTimeWithinWorkingSchedule(daySchedule, normalizedStart, normalizedEnd);

    // Check for overlaps with existing templates
    const existingTemplates = await appointmentsTemplatesRepository.findByStaffAndDay(
      doctorId,
      day_of_week
    );
    this.#validateNoOverlap(existingTemplates, normalizedStart, normalizedEnd);

    // Create template
    const template = await appointmentsTemplatesRepository.create({
      staff_id: doctorId,
      hospital_id: hospitalId,
      department_id: resolvedDepartmentId,
      day_of_week,
      start_time: normalizedStart,
      end_time: normalizedEnd,
      active_appointment_template: true
    });

    // Log action
    await logsRepository.create({
      user_id: currentUserId,
      action: "create appointment template",
      reason: `Created template for ${day_of_week} ${start_time}-${end_time}`
    });

    return template;
  }

  /**
   * Fetch all templates for a doctor
   * @param {string} doctorId - Doctor's UUID
   * @param {number} hospitalId - Hospital ID
   * @returns {Promise<Array>} Doctor's templates
   */
  async getTemplates(doctorId, hospitalId) {
    return appointmentsTemplatesRepository.findByStaffAssignment(
      doctorId,
      hospitalId,
      // We need to fetch the department from context, so let's get all for now
      // and filter on the service level
    );
    
    // Alternative: Get all and return
    return appointmentsTemplatesRepository.findByStaffId(doctorId);
  }

  /**
   * Fetch templates for a specific day
   * @param {string} doctorId - Doctor's UUID
   * @param {string} dayOfWeek - Day name
   * @returns {Promise<Array>} Templates for that day
   */
  async getTemplatesByDay(doctorId, dayOfWeek) {
    return appointmentsTemplatesRepository.findByStaffAndDay(doctorId, dayOfWeek);
  }

  /**
   * Update an existing template
   * @param {number} templateId - Template ID
   * @param {Object} data - Data to update
   * @param {string} doctorId - Doctor's UUID (for authorization)
   * @param {number} hospitalId - Hospital ID (for authorization)
   * @param {string} currentUserId - Current user ID (for logging)
   * @returns {Promise<Object>} Updated template
   * @throws {Error} If validation fails or unauthorized
   */
  async updateTemplate(templateId, data, doctorId, hospitalId, currentUserId) {
    const template = await appointmentsTemplatesRepository.findById(templateId);

    if (!template) {
      throw new Error("Template not found");
    }

    // Authorization check
    if (template.staff_id !== doctorId || template.hospital_id !== hospitalId) {
      throw new Error("Unauthorized: Cannot update other doctor's template");
    }

    const updateData = {};

    // If times are being updated, validate
    if (data.start_time || data.end_time) {
      const newStart = data.start_time ? this.#normalizeTime(data.start_time) : template.start_time;
      const newEnd = data.end_time ? this.#normalizeTime(data.end_time) : template.end_time;

      // Validate start < end
      if (this.#compareTime(newStart, newEnd) >= 0) {
        throw new Error("Start time must be before end time");
      }

      // Get working schedule for validation
      const workingSchedules = await staffWorkingSchedulesRepository.findByHospital(hospitalId);
      const daySchedule = workingSchedules.find(
        s => s.staff_id === doctorId && s.day_of_week === template.day_of_week
      );

      // Validate within working hours
      this.#validateTimeWithinWorkingSchedule(daySchedule, newStart, newEnd);

      // Check overlaps (excluding this template)
      const existingTemplates = await appointmentsTemplatesRepository.findByStaffAndDay(
        doctorId,
        template.day_of_week
      );
      const othersTemplates = existingTemplates.filter(t => t.id !== templateId);
      this.#validateNoOverlap(othersTemplates, newStart, newEnd);

      if (data.start_time) updateData.start_time = newStart;
      if (data.end_time) updateData.end_time = newEnd;
    }

    const updated = await appointmentsTemplatesRepository.update(templateId, updateData);

    await logsRepository.create({
      user_id: currentUserId,
      action: "update appointment template",
      reason: `Updated template ${templateId}`
    });

    return updated;
  }

  /**
   * Delete a template and its associated booking slots
   * @param {number} templateId - Template ID
   * @param {string} doctorId - Doctor's UUID (for authorization)
   * @param {number} hospitalId - Hospital ID (for authorization)
   * @param {string} currentUserId - Current user ID (for logging)
   * @returns {Promise<Object>} { success: true }
   * @throws {Error} If unauthorized or not found
   */
  async deleteTemplate(templateId, doctorId, hospitalId, currentUserId) {
    const template = await appointmentsTemplatesRepository.findById(templateId);

    if (!template) {
      throw new Error("Template not found");
    }

    // Authorization check
    if (template.staff_id !== doctorId || template.hospital_id !== hospitalId) {
      throw new Error("Unauthorized: Cannot delete other doctor's template");
    }

    // Deactivate all related booking slots instead of deleting
    const slots = await appointmentsBookingSlotsRepository.findByTemplateId(templateId);
    if (slots.length > 0) {
      const slotIds = slots.map(s => s.id);
      await appointmentsBookingSlotsRepository.deactivateBulk(slotIds);
    }

    // Soft delete the template
    await appointmentsTemplatesRepository.update(templateId, {
      active_appointment_template: false
    });

    await logsRepository.create({
      user_id: currentUserId,
      action: "delete appointment template",
      reason: `Deleted template ${templateId}`
    });

    return { success: true, message: "Template and related slots deactivated" };
  }

  /**
   * Get working days for a doctor
   * @param {string} doctorId - Doctor's UUID
   * @returns {Promise<Array>} Array of day names
   */
  async getWorkingDays(doctorId) {
    const days = await appointmentsTemplatesRepository.getStaffWorkingDays(doctorId);
    return days.map(d => d.day_of_week);
  }

  /**
   * Get summary of templates
   * @param {string} doctorId - Doctor's UUID
   * @returns {Promise<Object>} Summary with counts by day
   */
  async getTemplateSummary(doctorId) {
    const templates = await appointmentsTemplatesRepository.findByStaffId(doctorId);
    const summary = {
      total_templates: templates.length,
      by_day: {}
    };

    for (const template of templates) {
      if (!summary.by_day[template.day_of_week]) {
        summary.by_day[template.day_of_week] = [];
      }
      summary.by_day[template.day_of_week].push({
        id: template.id,
        start_time: template.start_time,
        end_time: template.end_time
      });
    }

    return summary;
  }
}

export default new DoctorAppointmentTemplatesService();
