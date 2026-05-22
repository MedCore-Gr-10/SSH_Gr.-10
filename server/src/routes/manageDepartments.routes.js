import { Router } from "express";
import ManageDepartmentsController from "../controllers/superuser-controllers/manageDepartments.controller.js";
const manageDepartmentsController = new ManageDepartmentsController();
const router = Router();

// /api/departments
router.route("/")
  .get((req, res, next) => manageDepartmentsController.getAll(req, res, next))
  .post((req, res, next) => manageDepartmentsController.create(req, res, next));

// /api/departments/:id
router.route("/:id")
  .get((req, res, next) => manageDepartmentsController.getById(req, res, next))
  .put((req, res, next) => manageDepartmentsController.update(req, res, next))
  .delete((req, res, next) => manageDepartmentsController.delete(req, res, next));

// /api/departments/:id/doctors
router.get("/:id/doctors", (req, res, next) => manageDepartmentsController.getDoctors(req, res, next));

export default router;