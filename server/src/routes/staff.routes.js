import express from "express";
import { JwtService } from "../utils/jwt.js";
import { AuthMiddleware } from "../middlewares/authMiddleware.js";
import { HospitalMiddleware } from "../middlewares/hospitalMiddleware.js";
import { RoleMiddleware } from "../middlewares/roleMiddleware.js";
import StaffScheduleController from "../controllers/staff-schedule.controller.js";

const router = express.Router();
const jwtService = new JwtService();
const authMiddleware = new AuthMiddleware(jwtService);
const hospitalMiddleware = new HospitalMiddleware();
const roleMiddleware = new RoleMiddleware("doctor", "nurse", "director");
const staffScheduleController = new StaffScheduleController();

router.use((req, res, next) => authMiddleware.handle(req, res, next));
router.use((req, res, next) => hospitalMiddleware.handle(req, res, next));
router.use((req, res, next) => roleMiddleware.handle(req, res, next));

/**
 * @swagger
 * /api/staff/schedules:
 *   get:
 *     summary: Get staff schedules
 *     description: Returns schedules for authenticated staff members
 *     tags:
 *       - Staff
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff schedules retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/schedules", (req, res, next) => staffScheduleController.getStaffSchedules(req, res, next));

export default router;
