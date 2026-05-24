import express from "express";
import prisma from "../prisma.js";
import userRepository from "../repositories/user.repository.js";
import profileRepository from "../repositories/profile.repository.js";
import rolesRepository from "../repositories/roles.repository.js";
import { JwtService } from "../utils/jwt.js";
import { AuthService } from "../services/authService.js";
import { AuthController } from "../controllers/authController.js";

const router = express.Router();

const jwtService = new JwtService();
const authService = new AuthService(
  prisma,
  jwtService,
  userRepository,
  profileRepository,
  rolesRepository,
);
const authController = new AuthController(authService);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account in the system
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *               role:
 *                 type: string
 *                 example: PATIENT
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input data
 */
router.post("/register", authController.register);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticates user and returns JWT token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", authController.login);

// Dev-only: create a mock JWT for frontend testing when backend runs in non-production
if (process.env.NODE_ENV !== "production") {
  /**
 * @swagger
 * /api/auth/dev/mock-login:
 *   post:
 *     summary: Development mock login
 *     description: Generates a mock JWT token for frontend testing in development mode
 *     tags:
 *       - Development
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               role:
 *                 type: string
 *                 example: director
 *               hospital_id:
 *                 type: integer
 *                 example: 1
 *               username:
 *                 type: string
 *                 example: devuser
 *               email:
 *                 type: string
 *                 example: dev@local
 *     responses:
 *       200:
 *         description: Mock token generated successfully
 *       500:
 *         description: Unable to generate mock token
 */
  router.post("/dev/mock-login", (req, res) => {
    const {
      id = 1,
      role = "director",
      hospital_id = null,
      username = "dev",
      email = "dev@local",
    } = req.body || {};
    const user = { id, role, hospital_id, username, email };
    try {
      const token = jwtService.generateToken(user);
      return res.json({ token, user });
    } catch (err) {
      console.error("Mock login error:", err);
      return res.status(500).json({ error: "Unable to create mock token" });
    }
  });
}

export default router;
