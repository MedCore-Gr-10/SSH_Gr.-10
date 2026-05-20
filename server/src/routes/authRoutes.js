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

router.post("/register", authController.register);
router.post("/login", authController.login);

// Dev-only: create a mock JWT for frontend testing when backend runs in non-production
if (process.env.NODE_ENV !== "production") {
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
