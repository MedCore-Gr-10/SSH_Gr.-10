import express from "express";
import { JwtService } from "../utils/jwt.js";
import { AuthMiddleware } from "../middlewares/authMiddleware.js";
import { HospitalMiddleware } from "../middlewares/hospitalMiddleware.js";
import { RoleMiddleware } from "../middlewares/roleMiddleware.js";
import NurseController from "../controllers/nurse-controllers/nurse.controller.js";

const router = express.Router();
const jwtService = new JwtService();
const authMiddleware = new AuthMiddleware(jwtService);
const hospitalMiddleware = new HospitalMiddleware();
const roleMiddleware = new RoleMiddleware("nurse", "NURSE");

router.use((req, res, next) => authMiddleware.handle(req, res, next));
router.use((req, res, next) => hospitalMiddleware.handle(req, res, next));
router.use((req, res, next) => roleMiddleware.handle(req, res, next));

/**
 * @swagger
 * /api/nurse/dashboard:
 *   get:
 *     summary: Get nurse dashboard
 *     description: Returns dashboard statistics and overview for the logged-in nurse
 *     tags:
 *       - Nurse
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/dashboard", (req, res, next) =>
  NurseController.getDashboard(req, res, next),
);

/**
 * @swagger
 * /api/nurse/schedules/me:
 *   get:
 *     summary: Get my schedule
 *     description: Returns the logged-in nurse schedule
 *     tags:
 *       - Nurse Schedules
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Schedule retrieved successfully
 */
router.get("/schedules/me", (req, res, next) =>
  NurseController.getMySchedule(req, res, next),
);

/**
 * @swagger
 * /api/nurse/schedules/staff:
 *   get:
 *     summary: Get staff schedules
 *     description: Returns schedules for hospital staff
 *     tags:
 *       - Nurse Schedules
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff schedules retrieved successfully
 */
router.get("/schedules/staff", (req, res, next) =>
  NurseController.getStaffSchedules(req, res, next),
);

/**
 * @swagger
 * /api/nurse/patients:
 *   get:
 *     summary: Get patients
 *     description: Returns all patients accessible to the nurse
 *     tags:
 *       - Nurse Patients
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patients retrieved successfully
 */
router.get("/patients", (req, res, next) =>
  NurseController.getPatients(req, res, next),
);

/**
 * @swagger
 * /api/nurse/patients/search:
 *   get:
 *     summary: Search patients
 *     description: Searches patients using query parameters
 *     tags:
 *       - Nurse Patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *         example: John
 *     responses:
 *       200:
 *         description: Patients found successfully
 */
router.get("/patients/search", (req, res, next) =>
  NurseController.searchPatients(req, res, next),
);

/**
 * @swagger
 * /api/nurse/patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     description: Returns detailed information about a patient
 *     tags:
 *       - Nurse Patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient retrieved successfully
 *       404:
 *         description: Patient not found
 */
router.get("/patients/:id", (req, res, next) =>
  NurseController.getPatient(req, res, next),
);

/**
 * @swagger
 * /api/nurse/patients/{id}/allergies:
 *   get:
 *     summary: Get patient allergies
 *     description: Returns allergy information for a patient
 *     tags:
 *       - Nurse Patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Allergies retrieved successfully
 */
router.get("/patients/:id/allergies", (req, res, next) =>
  NurseController.getPatientAllergies(req, res, next),
);

/**
 * @swagger
 * /api/nurse/patients/{id}/insurance:
 *   get:
 *     summary: Get patient insurance
 *     description: Returns insurance information for a patient
 *     tags:
 *       - Nurse Patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Insurance information retrieved successfully
 */
router.get("/patients/:id/insurance", (req, res, next) =>
  NurseController.getPatientInsurance(req, res, next),
);

/**
 * @swagger
 * /api/nurse/patients/{id}/emergency-contacts:
 *   get:
 *     summary: Get patient emergency contacts
 *     description: Returns emergency contacts for a patient
 *     tags:
 *       - Nurse Patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Emergency contacts retrieved successfully
 */
router.get("/patients/:id/emergency-contacts", (req, res, next) =>
  NurseController.getPatientEmergencyContacts(req, res, next),
);

/**
 * @swagger
 * /api/nurse/patients/{id}/appointments:
 *   get:
 *     summary: Get patient appointments
 *     description: Returns appointments for a patient
 *     tags:
 *       - Nurse Patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 */
router.get("/patients/:id/appointments", (req, res, next) =>
  NurseController.getPatientAppointments(req, res, next),
);

/**
 * @swagger
 * /api/nurse/patients/{id}/history:
 *   get:
 *     summary: Get patient history
 *     description: Returns medical history for a patient
 *     tags:
 *       - Nurse Patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Medical history retrieved successfully
 */
router.get("/patients/:id/history", (req, res, next) =>
  NurseController.getPatientHistory(req, res, next),
);

/**
 * @swagger
 * /api/nurse/logs:
 *   get:
 *     summary: Get access logs
 *     description: Returns patient access logs for auditing purposes
 *     tags:
 *       - Nurse Logs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logs retrieved successfully
 */
router.get("/logs", (req, res, next) =>
  NurseController.getAccessLogs(req, res, next),
);

export default router;
