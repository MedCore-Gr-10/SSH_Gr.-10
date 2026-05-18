import express from "express";
import ManageSpecializationsController from "../controllers/superuser-controllers/manageSpecialization.controller.js";

const router = express.Router();
const manageSpecializationsController = new ManageSpecializationsController();

// GET /api/specializations
router.get("/", (req, res, next) =>
  manageSpecializationsController.getAll(req, res, next)
);

// POST /api/specializations
router.post("/", (req, res, next) =>
  manageSpecializationsController.create(req, res, next)
);

// PUT /api/specializations/:id
router.put("/:id", (req, res, next) =>
  manageSpecializationsController.update(req, res, next)
);

export default router;