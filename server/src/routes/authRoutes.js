import express from "express";
import prisma from "../prisma.js";
import { JwtService } from "../utils/jwt.js";
import { AuthService } from "../services/authService.js";
import { AuthController } from "../controllers/authController.js";
import { AuthMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

const jwtService = new JwtService();
const authService = new AuthService(prisma, jwtService);
const authController = new AuthController(authService);
const authMiddleware = new AuthMiddleware(jwtService);

router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;
