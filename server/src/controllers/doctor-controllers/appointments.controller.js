import appointmentTemplatesService from "../../services/doctor-services/appointmentTemplates.service.js";
import slotGeneratorService from "../../services/doctor-services/slotGenerator.service.js";
import appointmentsBookingSlotsRepository from "../../repositories/appointments-booking-slots.repository.js";

/**
 * Doctor Appointment Templates Controller
 * Handles REST API endpoints for template and slot management
 */
class DoctorAppointmentTemplatesController {

  /**
   * GET /api/doctor/appointments/templates
   * Fetch all recurring templates for the doctor
   */
  async getTemplates(req, res, next) {
    try {
      const doctorId = req.user.user_id;
      const hospitalId = req.user.hospital_id;

      if (!hospitalId) {
        return res.status(400).json({ error: "Hospital ID is required" });
      }

      const templates = await appointmentTemplatesService.getTemplates(doctorId, hospitalId);
      res.status(200).json({ success: true, data: templates });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/doctor/appointments/templates/by-day/:day
   * Fetch templates for a specific day
   */
  async getTemplatesByDay(req, res, next) {
    try {
      const { day } = req.params;
      const doctorId = req.user.user_id;

      const templates = await appointmentTemplatesService.getTemplatesByDay(doctorId, day);
      res.status(200).json({ success: true, data: templates });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/doctor/appointments/templates/summary
   * Get summary of templates with counts by day
   */
  async getTemplateSummary(req, res, next) {
    try {
      const doctorId = req.user.user_id;

      const summary = await appointmentTemplatesService.getTemplateSummary(doctorId);
      res.status(200).json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/doctor/appointments/templates
   * Create a new recurring appointment template
   * 
   * Body: { day_of_week, start_time, end_time }
   */
  async createTemplate(req, res, next) {
    try {
      const doctorId = req.user.user_id;
      const hospitalId = req.user.hospital_id;
      const { department_id } = req.query; // Department ID should be in query or body

      if (!hospitalId || !department_id) {
        return res.status(400).json({ error: "Hospital ID and department ID are required" });
      }

      const template = await appointmentTemplatesService.createTemplate(
        req.body,
        doctorId,
        hospitalId,
        Number(department_id),
        doctorId
      );

      res.status(201).json({ success: true, data: template });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/doctor/appointments/templates/:id
   * Update a recurring template
   */
  async updateTemplate(req, res, next) {
    try {
      const { id } = req.params;
      const doctorId = req.user.user_id;
      const hospitalId = req.user.hospital_id;

      const template = await appointmentTemplatesService.updateTemplate(
        Number(id),
        req.body,
        doctorId,
        hospitalId,
        doctorId
      );

      res.status(200).json({ success: true, data: template });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/doctor/appointments/templates/:id
   * Delete a template and deactivate its slots
   */
  async deleteTemplate(req, res, next) {
    try {
      const { id } = req.params;
      const doctorId = req.user.user_id;
      const hospitalId = req.user.hospital_id;

      const result = await appointmentTemplatesService.deleteTemplate(
        Number(id),
        doctorId,
        hospitalId,
        doctorId
      );

      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

/**
 * Doctor Appointment Slots Controller
 * Handles REST API endpoints for booking slots
 */
class DoctorAppointmentSlotsController {

  /**
   * GET /api/doctor/appointments/slots
   * Fetch doctor's booking slots (optionally filtered by date)
   * Query: ?date=2026-06-01 (optional)
   */
  async getSlots(req, res, next) {
    try {
      const doctorId = req.user.user_id;
      const { date } = req.query;

      const slots = await appointmentsBookingSlotsRepository.findDoctorSlots(
        doctorId,
        date ? new Date(date) : null
      );

      res.status(200).json({ success: true, data: slots });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/doctor/appointments/slots/available
   * Fetch only available (unbooked) slots
   * Query: ?date=2026-06-01 (optional)
   */
  async getAvailableSlots(req, res, next) {
    try {
      const doctorId = req.user.user_id;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ error: "Date parameter is required" });
      }

      const slots = await appointmentsBookingSlotsRepository.findAvailableDoctorSlots(
        doctorId,
        new Date(date)
      );

      res.status(200).json({ success: true, data: slots });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/doctor/appointments/slots/:id
   * Fetch a specific slot
   */
  async getSlot(req, res, next) {
    try {
      const { id } = req.params;
      const slot = await appointmentsBookingSlotsRepository.findById(Number(id));

      if (!slot) {
        return res.status(404).json({ error: "Slot not found" });
      }

      // Check authorization
      if (slot.doctor_id !== req.user.user_id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      res.status(200).json({ success: true, data: slot });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/doctor/appointments/slots/generation/status
   * Get current generation status
   */
  async getGenerationStatus(req, res, next) {
    try {
      const doctorId = req.user.user_id;
      const status = await slotGeneratorService.getGenerationStatus(doctorId);

      res.status(200).json({ success: true, data: status });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/doctor/appointments/slots/generate/week
   * Generate slots for next 7 days
   * This is for manual triggering in development/testing
   */
  async generateWeeklySlots(req, res, next) {
    try {
      const doctorId = req.user.user_id;

      const result = await slotGeneratorService.generateWeeklySlots(
        doctorId,
        new Date(),
        doctorId
      );

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/doctor/appointments/slots/generate/range
   * Generate slots for a date range
   * Body: { from_date, to_date } (YYYY-MM-DD format)
   */
  async generateSlotsForRange(req, res, next) {
    try {
      const doctorId = req.user.user_id;
      const { from_date, to_date } = req.body;

      if (!from_date || !to_date) {
        return res.status(400).json({ error: "from_date and to_date are required" });
      }

      const result = await slotGeneratorService.generateSlotsForDateRange(
        doctorId,
        new Date(from_date),
        new Date(to_date),
        doctorId
      );

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/doctor/appointments/slots/generate/template/:id
   * Generate slots for a specific template
   * Body: { start_date, end_date } (YYYY-MM-DD format)
   */
  async generateSlotsForTemplate(req, res, next) {
    try {
      const { id } = req.params;
      const { start_date, end_date } = req.body;

      if (!start_date || !end_date) {
        return res.status(400).json({ error: "start_date and end_date are required" });
      }

      const result = await slotGeneratorService.generateSlotsForTemplate(
        Number(id),
        new Date(start_date),
        new Date(end_date),
        req.user.user_id
      );

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/doctor/appointments/slots/:id
   * Deactivate a slot
   */
  async deactivateSlot(req, res, next) {
    try {
      const { id } = req.params;
      const slot = await appointmentsBookingSlotsRepository.findById(Number(id));

      if (!slot) {
        return res.status(404).json({ error: "Slot not found" });
      }

      // Check authorization
      if (slot.doctor_id !== req.user.user_id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Check if booked
      const isBooked = await appointmentsBookingSlotsRepository.isBooked(Number(id));
      if (isBooked) {
        return res.status(400).json({ error: "Cannot deactivate a booked slot" });
      }

      const deactivated = await appointmentsBookingSlotsRepository.deactivate(Number(id));
      res.status(200).json({ success: true, data: deactivated });
    } catch (err) {
      next(err);
    }
  }
}

export { DoctorAppointmentTemplatesController, DoctorAppointmentSlotsController };
