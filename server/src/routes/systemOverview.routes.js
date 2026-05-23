import { Router } from "express";
import systemOverviewController from "../controllers/superuser-controllers/systemOverview.controller.js";

const router = Router();

/**
 * @swagger
 * /api/system-overview:
 * get:
 * summary: Get global system overview stats
 * description: Returns aggregated metrics for users, roles, and registered hospitals for the superuser dashboard.
 * tags:
 * - System Overview
 * responses:
 * 200:
 * description: Stats retrieved successfully
 * 500:
 * description: Internal server error
 */
router.get("/", (req, res) => systemOverviewController.getOverview(req, res));

export default router;