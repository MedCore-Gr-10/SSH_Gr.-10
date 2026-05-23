import express from "express";
import { JwtService } from "../utils/jwt.js";
import { AuthMiddleware } from "../middlewares/authMiddleware.js";
import { HospitalMiddleware } from "../middlewares/hospitalMiddleware.js";
import RequestsController from "../controllers/director-controllers/requests.controller.js";

const router = express.Router();
const jwtService = new JwtService();
const authMiddleware = new AuthMiddleware(jwtService);
const hospitalMiddleware = new HospitalMiddleware();
const requestsController = new RequestsController();

router.use((req, res, next) => authMiddleware.handle(req, res, next));
router.use((req, res, next) => hospitalMiddleware.handle(req, res, next));

router.get("/recipients", (req, res, next) => requestsController.getRecipients(req, res, next));
router.get("/", (req, res, next) => requestsController.getRequests(req, res, next));
router.post("/", (req, res, next) => requestsController.createRequest(req, res, next));

export default router;
