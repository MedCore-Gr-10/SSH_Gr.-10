import express from "express";
import { JwtService } from "../utils/jwt.js";
import { AuthMiddleware } from "../middlewares/authMiddleware.js";
import { RoleMiddleware } from "../middlewares/roleMiddleware.js";
import {
  DoctorAppointmentTemplatesController,
  DoctorAppointmentSlotsController
} from "../controllers/doctor-controllers/appointments.controller.js";
import DoctorPatientsController from "../controllers/doctor-controllers/patients.controller.js";
import DoctorDashboardController from "../controllers/doctor-controllers/dashboard.controller.js";

const router = express.Router();
const jwtService = new JwtService();
const authMiddleware = new AuthMiddleware(jwtService);
const roleMiddleware = new RoleMiddleware("doctor", "DOCTOR");
const templatesController = new DoctorAppointmentTemplatesController();
const slotsController = new DoctorAppointmentSlotsController();
const patientsController = new DoctorPatientsController();
const dashboardController = new DoctorDashboardController();

/**
 * All routes require doctor authentication
 */
router.use((req, res, next) => authMiddleware.handle(req, res, next));
router.use((req, res, next) => roleMiddleware.handle(req, res, next));

/**
 * GET /api/doctor/patients
 * Fetch unique patients previously treated by the logged-in doctor
 */
router.get(
  "/patients",
  (req, res, next) => patientsController.getPatients(req, res, next)
);

router.get(
  "/dashboard",
  (req, res, next) => dashboardController.getDashboard(req, res, next)
);

/**
 * GET /api/doctor/patients/:id/history
 * Get patient history with access reason logging
 */
router.get(
  "/patients/:id/history",
  (req, res, next) => patientsController.getPatientHistory(req, res, next)
);

/**
 * GET /api/doctor/patients/:id/allergies
 * Get patient allergies with access reason logging
 */
router.get(
  "/patients/:id/allergies",
  (req, res, next) => patientsController.getPatientAllergies(req, res, next)
);

/**
 * GET /api/doctor/patients/:id/insurance
 * Get patient insurance with access reason logging
 */
router.get(
  "/patients/:id/insurance",
  (req, res, next) => patientsController.getPatientInsurance(req, res, next)
);

/**
 * GET /api/doctor/patients/:id/emergency-contacts
 * Get patient emergency contacts with access reason logging
 */
router.get(
  "/patients/:id/emergency-contacts",
  (req, res, next) => patientsController.getPatientEmergencyContacts(req, res, next)
);

/**
 * GET /api/doctor/patients/:id/appointments
 * Get patient appointments with access reason logging
 */
router.get(
  "/patients/:id/appointments",
  (req, res, next) => patientsController.getPatientAppointments(req, res, next)
);

/**
 * ===================================
 * APPOINTMENT TEMPLATES ENDPOINTS
 * ===================================
 */

/**
 * @swagger
 * /api/doctor/appointments/assignments:
 *   get:
 *     summary: Get doctor assignments
 *     description: Returns hospital and department assignments for the logged-in doctor
 *     tags:
 *       - Doctor Appointments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assignments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/appointments/assignments",
  (req, res, next) => templatesController.getAssignments(req, res, next)
);

/**
 * @swagger
 * /api/doctor/appointments/templates:
 *   get:
 *     summary: Get appointment templates
 *     description: Returns all recurring appointment templates for the doctor
 *     tags:
 *       - Doctor Appointment Templates
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/appointments/templates",
  (req, res, next) => templatesController.getTemplates(req, res, next)
);

/**
 * @swagger
 * /api/doctor/appointments/templates/summary:
 *   get:
 *     summary: Get appointment templates summary
 *     description: Returns template counts grouped by day
 *     tags:
 *       - Doctor Appointment Templates
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Template summary retrieved successfully
 */
router.get(
  "/appointments/templates/summary",
  (req, res, next) => templatesController.getTemplateSummary(req, res, next)
);

/**
 * @swagger
 * /api/doctor/appointments/templates/by-day/{day}:
 *   get:
 *     summary: Get templates by day
 *     description: Returns appointment templates for a specific weekday
 *     tags:
 *       - Doctor Appointment Templates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: day
 *         required: true
 *         schema:
 *           type: string
 *         description: Day of the week
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 *       404:
 *         description: No templates found
 */
router.get(
  "/appointments/templates/by-day/:day",
  (req, res, next) => templatesController.getTemplatesByDay(req, res, next)
);

/**
 * @swagger
 * /api/doctor/appointments/templates:
 *   post:
 *     summary: Create appointment template
 *     description: Creates a recurring appointment template
 *     tags:
 *       - Doctor Appointment Templates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               day_of_week:
 *                 type: string
 *                 example: Monday
 *               start_time:
 *                 type: string
 *                 example: "09:00:00"
 *               end_time:
 *                 type: string
 *                 example: "09:30:00"
 *     responses:
 *       201:
 *         description: Template created successfully
 *       400:
 *         description: Bad request
 */
router.post(
  "/appointments/templates",
  (req, res, next) => templatesController.createTemplate(req, res, next)
);

/**
 * @swagger
 * /api/doctor/appointments/templates/{id}:
 *   put:
 *     summary: Update appointment template
 *     description: Updates an existing recurring appointment template
 *     tags:
 *       - Doctor Appointment Templates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               start_time:
 *                 type: string
 *                 example: "10:00:00"
 *               end_time:
 *                 type: string
 *                 example: "10:30:00"
 *     responses:
 *       200:
 *         description: Template updated successfully
 *       404:
 *         description: Template not found
 */
router.put(
  "/appointments/templates/:id",
  (req, res, next) => templatesController.updateTemplate(req, res, next)
);

/**
 * @swagger
 * /api/doctor/appointments/templates/{id}:
 *   delete:
 *     summary: Delete appointment template
 *     description: Deactivates an appointment template and its slots
 *     tags:
 *       - Doctor Appointment Templates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *       404:
 *         description: Template not found
 */
router.delete(
  "/appointments/templates/:id",
  (req, res, next) => templatesController.deleteTemplate(req, res, next)
);

/**
 * @swagger
 * /api/doctor/appointments/slots:
 *   get:
 *     summary: Get appointment slots
 *     description: Returns appointment booking slots, optionally filtered by date
 *     tags:
 *       - Doctor Appointment Slots
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Filter slots by date
 *         example: 2026-06-01
 *     responses:
 *       200:
 *         description: Slots retrieved successfully
 */
router.get(
  "/appointments/slots",
  (req, res, next) => slotsController.getSlots(req, res, next)
);

/**
 * @swagger
 * /api/doctor/appointments/slots/available:
 *   get:
 *     summary: Get available appointment slots
 *     description: Returns only unbooked appointment slots for a date
 *     tags:
 *       - Doctor Appointment Slots
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *         example: 2026-06-01
 *     responses:
 *       200:
 *         description: Available slots retrieved successfully
 */
router.get(
  "/appointments/slots/available",
  (req, res, next) => slotsController.getAvailableSlots(req, res, next)
);

/**
 * @swagger
 * /api/doctor/appointments/slots/generation/status:
 *   get:
 *     summary: Get slot generation status
 *     description: Returns slot generation health and status
 *     tags:
 *       - Doctor Appointment Slots
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Generation status retrieved successfully
 */
router.get(
  "/appointments/slots/generation/status",
  (req, res, next) => slotsController.getGenerationStatus(req, res, next)
);

/**
 * @swagger
 * /api/doctor/appointments/slots/{id}:
 *   get:
 *     summary: Get appointment slot by ID
 *     description: Returns a specific appointment slot
 *     tags:
 *       - Doctor Appointment Slots
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Slot ID
 *     responses:
 *       200:
 *         description: Slot retrieved successfully
 *       404:
 *         description: Slot not found
 */
router.get(
  "/appointments/slots/:id",
  (req, res, next) => slotsController.getSlot(req, res, next)
);

/**
 * @swagger
 * /api/doctor/appointments/slots/generate/week:
 *   post:
 *     summary: Generate weekly slots
 *     description: Manually generates appointment slots for the next 7 days
 *     tags:
 *       - Doctor Slot Generation
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Weekly slots generated successfully
 */
router.post(
  "/appointments/slots/generate/week",
  (req, res, next) => slotsController.generateWeeklySlots(req, res, next)
);

/**
 * @swagger
 * /api/doctor/appointments/slots/generate/range:
 *   post:
 *     summary: Generate slots for date range
 *     description: Generates appointment slots for a custom date range
 *     tags:
 *       - Doctor Slot Generation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               from_date:
 *                 type: string
 *                 example: 2026-06-01
 *               to_date:
 *                 type: string
 *                 example: 2026-06-30
 *     responses:
 *       201:
 *         description: Slots generated successfully
 */
router.post(
  "/appointments/slots/generate/range",
  (req, res, next) => slotsController.generateSlotsForRange(req, res, next)
);

/**
 * @swagger
 * /api/doctor/appointments/slots/generate/template/{id}:
 *   post:
 *     summary: Generate slots for template
 *     description: Generates appointment slots for a specific template
 *     tags:
 *       - Doctor Slot Generation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               start_date:
 *                 type: string
 *                 example: 2026-06-01
 *               end_date:
 *                 type: string
 *                 example: 2026-06-30
 *     responses:
 *       201:
 *         description: Slots generated successfully
 */
router.post(
  "/appointments/slots/generate/template/:id",
  (req, res, next) => slotsController.generateSlotsForTemplate(req, res, next)
);

/**
 * @swagger
 * /api/doctor/appointments/slots/{id}:
 *   delete:
 *     summary: Deactivate appointment slot
 *     description: Soft deletes an appointment slot if it is not booked
 *     tags:
 *       - Doctor Appointment Slots
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Slot ID
 *     responses:
 *       200:
 *         description: Slot deactivated successfully
 *       400:
 *         description: Slot cannot be deactivated
 *       404:
 *         description: Slot not found
 */
router.delete(
  "/appointments/slots/:id",
  (req, res, next) => slotsController.deactivateSlot(req, res, next)
);

export default router;
