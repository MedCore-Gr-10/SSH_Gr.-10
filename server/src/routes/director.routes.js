import express from "express";
import { JwtService } from "../utils/jwt.js";
import { AuthMiddleware } from "../middlewares/authMiddleware.js";
import { HospitalMiddleware } from "../middlewares/hospitalMiddleware.js";
import { RoleMiddleware } from "../middlewares/roleMiddleware.js";
import PatientController from "../controllers/director-controllers/patient.controller.js";

const router = express.Router();
const jwtService = new JwtService();
const authMiddleware = new AuthMiddleware(jwtService);
const hospitalMiddleware = new HospitalMiddleware();
const roleMiddleware = new RoleMiddleware("director", "DIRECTOR");
const patientController = new PatientController();

router.use((req, res, next) => authMiddleware.handle(req, res, next));
router.use((req, res, next) => hospitalMiddleware.handle(req, res, next));
router.use((req, res, next) => roleMiddleware.handle(req, res, next));

router.get("/patients", (req, res, next) => patientController.getPatients(req, res, next));
router.post("/patients", (req, res, next) => patientController.createPatient(req, res, next));
router.put("/patients/:id", (req, res, next) => patientController.updatePatient(req, res, next));
router.delete("/patients/:id", (req, res, next) => patientController.deletePatient(req, res, next));

export default router;
