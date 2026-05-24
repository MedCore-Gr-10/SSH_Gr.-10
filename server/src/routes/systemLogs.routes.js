import { Router } from "express";
import logsRepository from "../repositories/logs.repository.js";

const router = Router();

/**
 * @swagger
 * /api/system-logs:
 *   get:
 *     summary: Get system logs
 *     description: Returns all system activity logs
 *     tags:
 *       - System Logs
 *     responses:
 *       200:
 *         description: Logs retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get("/", async (req, res, next) => {
  try {
    const logs = await logsRepository.findAll();

    res.status(200).json({
      success: true,
      data: logs.map((log) => ({
        id: log.id,
        timestamp: log.timestamp,
        level: "INFO",
        username: log.user?.username || log.user_id,
        action: log.action,
        module: "system",
        details: log.reason || "",
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
