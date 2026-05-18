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

// Dev-only: create a mock JWT for frontend testing when backend runs in non-production
if (process.env.NODE_ENV !== "production") {
	router.post("/dev/mock-login", (req, res) => {
		const { id = 1, role = "director", hospital_id = null, username = "dev", email = "dev@local" } = req.body || {};
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
