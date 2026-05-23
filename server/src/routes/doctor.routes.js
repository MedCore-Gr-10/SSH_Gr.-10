import express from "express";
import { JwtService } from "../utils/jwt.js";
import { AuthMiddleware } from "../middlewares/authMiddleware.js";
import { RoleMiddleware } from "../middlewares/roleMiddleware.js";
import {
  DoctorAppointmentTemplatesController,
  DoctorAppointmentSlotsController
} from "../controllers/doctor-controllers/appointments.controller.js";

const router = express.Router();
const jwtService = new JwtService();
const authMiddleware = new AuthMiddleware(jwtService);
const roleMiddleware = new RoleMiddleware("doctor", "DOCTOR");
const templatesController = new DoctorAppointmentTemplatesController();
const slotsController = new DoctorAppointmentSlotsController();

/**
 * All routes require doctor authentication
 */
router.use((req, res, next) => authMiddleware.handle(req, res, next));
router.use((req, res, next) => roleMiddleware.handle(req, res, next));

/**
 * ===================================
 * APPOINTMENT TEMPLATES ENDPOINTS
 * ===================================
 */

/**
 * GET /api/doctor/appointments/templates
 * Fetch all recurring templates for the doctor
 */
router.get(
  "/appointments/templates",
  (req, res, next) => templatesController.getTemplates(req, res, next)
);

/**
 * GET /api/doctor/appointments/templates/summary
 * Get summary of templates with counts by day
 */
router.get(
  "/appointments/templates/summary",
  (req, res, next) => templatesController.getTemplateSummary(req, res, next)
);

/**
 * GET /api/doctor/appointments/templates/by-day/:day
 * Fetch templates for a specific day (Monday, Tuesday, etc)
 */
router.get(
  "/appointments/templates/by-day/:day",
  (req, res, next) => templatesController.getTemplatesByDay(req, res, next)
);

/**
 * POST /api/doctor/appointments/templates?department_id=1
 * Create a new recurring template
 * 
 * Body: {
 *   "day_of_week": "Monday",
 *   "start_time": "09:00:00",
 *   "end_time": "09:30:00"
 * }
 */
router.post(
  "/appointments/templates",
  (req, res, next) => templatesController.createTemplate(req, res, next)
);

/**
 * PUT /api/doctor/appointments/templates/:id
 * Update a template
 * 
 * Body: {
 *   "start_time": "10:00:00",  (optional)
 *   "end_time": "10:30:00"     (optional)
 * }
 */
router.put(
  "/appointments/templates/:id",
  (req, res, next) => templatesController.updateTemplate(req, res, next)
);

/**
 * DELETE /api/doctor/appointments/templates/:id
 * Delete a template (deactivates it and its slots)
 */
router.delete(
  "/appointments/templates/:id",
  (req, res, next) => templatesController.deleteTemplate(req, res, next)
);

/**
 * ===================================
 * APPOINTMENT SLOTS ENDPOINTS
 * ===================================
 */

/**
 * GET /api/doctor/appointments/slots
 * Fetch booking slots (optionally filtered by date)
 * Query params: ?date=2026-06-01
 */
router.get(
  "/appointments/slots",
  (req, res, next) => slotsController.getSlots(req, res, next)
);

/**
 * GET /api/doctor/appointments/slots/available?date=2026-06-01
 * Fetch only available (unbooked) slots for a date
 * Note: Date is required for this endpoint
 */
router.get(
  "/appointments/slots/available",
  (req, res, next) => slotsController.getAvailableSlots(req, res, next)
);

/**
 * GET /api/doctor/appointments/slots/generation/status
 * Get current slot generation status and health
 */
router.get(
  "/appointments/slots/generation/status",
  (req, res, next) => slotsController.getGenerationStatus(req, res, next)
);

/**
 * GET /api/doctor/appointments/slots/:id
 * Fetch a specific slot
 */
router.get(
  "/appointments/slots/:id",
  (req, res, next) => slotsController.getSlot(req, res, next)
);

/**
 * ===================================
 * SLOT GENERATION ENDPOINTS (Testing)
 * ===================================
 * These are primarily for testing and development
 * In production, slots are generated automatically by cron job
 */

/**
 * POST /api/doctor/appointments/slots/generate/week
 * Generate slots for next 7 days (manual trigger for testing)
 */
router.post(
  "/appointments/slots/generate/week",
  (req, res, next) => slotsController.generateWeeklySlots(req, res, next)
);

/**
 * POST /api/doctor/appointments/slots/generate/range
 * Generate slots for a date range
 * 
 * Body: {
 *   "from_date": "2026-06-01",
 *   "to_date": "2026-06-30"
 * }
 */
router.post(
  "/appointments/slots/generate/range",
  (req, res, next) => slotsController.generateSlotsForRange(req, res, next)
);

/**
 * POST /api/doctor/appointments/slots/generate/template/:id
 * Generate slots for a specific template
 * 
 * Body: {
 *   "start_date": "2026-06-01",
 *   "end_date": "2026-06-30"
 * }
 */
router.post(
  "/appointments/slots/generate/template/:id",
  (req, res, next) => slotsController.generateSlotsForTemplate(req, res, next)
);

/**
 * DELETE /api/doctor/appointments/slots/:id
 * Deactivate a slot (soft delete)
 * Note: Cannot deactivate booked slots
 */
router.delete(
  "/appointments/slots/:id",
  (req, res, next) => slotsController.deactivateSlot(req, res, next)
);

export default router;
