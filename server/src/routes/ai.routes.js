import express from "express";
import { JwtService } from "../utils/jwt.js";
import { AuthMiddleware } from "../middlewares/authMiddleware.js";
import { RoleMiddleware } from "../middlewares/roleMiddleware.js";
import aiController from "../controllers/ai.controller.js";

const router = express.Router();
const jwtService = new JwtService();
const authMiddleware = new AuthMiddleware(jwtService);
const roleMiddleware = new RoleMiddleware("patient", "PATIENT");

router.use((req, res, next) => authMiddleware.handle(req, res, next));
router.use((req, res, next) => roleMiddleware.handle(req, res, next));

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Send a patient help-assistant message
 *     description: Sends a patient question to the MedCore help assistant. The assistant is restricted to application-help topics and does not provide medical advice.
 *     tags:
 *       - AI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: How do I book an appointment?
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: Assistant response generated successfully
 *       400:
 *         description: Message is missing
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       503:
 *         description: Gemini API key is missing or the AI provider is unavailable
 */
router.post("/chat", (req, res, next) => aiController.chat(req, res, next));

export default router;
