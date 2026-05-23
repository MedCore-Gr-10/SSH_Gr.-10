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

router.get("/dashboard", (req, res, next) =>
  NurseController.getDashboard(req, res, next),
);
router.get("/schedules/me", (req, res, next) =>
  NurseController.getMySchedule(req, res, next),
);
router.get("/schedules/staff", (req, res, next) =>
  NurseController.getStaffSchedules(req, res, next),
);
router.get("/patients", (req, res, next) =>
  NurseController.getPatients(req, res, next),
);
router.get("/patients/search", (req, res, next) =>
  NurseController.searchPatients(req, res, next),
);
router.get("/patients/:id", (req, res, next) =>
  NurseController.getPatient(req, res, next),
);
router.get("/patients/:id/allergies", (req, res, next) =>
  NurseController.getPatientAllergies(req, res, next),
);
router.get("/patients/:id/insurance", (req, res, next) =>
  NurseController.getPatientInsurance(req, res, next),
);
router.get("/patients/:id/emergency-contacts", (req, res, next) =>
  NurseController.getPatientEmergencyContacts(req, res, next),
);
router.get("/patients/:id/appointments", (req, res, next) =>
  NurseController.getPatientAppointments(req, res, next),
);
router.get("/patients/:id/history", (req, res, next) =>
  NurseController.getPatientHistory(req, res, next),
);
router.get("/logs", (req, res, next) =>
  NurseController.getAccessLogs(req, res, next),
);

export default router;
