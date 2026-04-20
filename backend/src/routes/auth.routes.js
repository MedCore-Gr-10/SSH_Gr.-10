import express from "express";
import prisma from "../prisma.js";
import { JwtService } from "../utils/jwt.js";
import { AuthService } from "../services/auth.service.js";
import { AuthController } from "../controllers/auth.controller.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

const jwtService = new JwtService();
const authService = new AuthService(prisma, jwtService);
const authController = new AuthController(authService);
const authMiddleware = new AuthMiddleware(jwtService);

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post(
  "/select-hospital",
  authMiddleware.handle,
  authController.selectHospitals
);

export default router;
