import { Router } from "express";
import ManageDepartmentsController from "../controllers/superuser-controllers/manageDepartments.controller.js";
const manageDepartmentsController = new ManageDepartmentsController();
const router = Router();

// /api/departments
/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Get all departments
 *     description: Returns all hospital departments
 *     tags:
 *       - Departments
 *     responses:
 *       200:
 *         description: Departments retrieved successfully
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create department
 *     description: Creates a new hospital department
 *     tags:
 *       - Departments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cardiology
 *               description:
 *                 type: string
 *                 example: Handles heart-related treatments and diagnostics
 *     responses:
 *       201:
 *         description: Department created successfully
 *       400:
 *         description: Bad request
 */
router.route("/")
  .get((req, res, next) => manageDepartmentsController.getAll(req, res, next))
  .post((req, res, next) => manageDepartmentsController.create(req, res, next));

// /api/departments/:id
/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     description: Returns a single department by its ID
 *     tags:
 *       - Departments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department retrieved successfully
 *       404:
 *         description: Department not found
 *
 *   put:
 *     summary: Update department
 *     description: Updates an existing department
 *     tags:
 *       - Departments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Neurology
 *               description:
 *                 type: string
 *                 example: Specialized department for brain and nervous system treatments
 *     responses:
 *       200:
 *         description: Department updated successfully
 *       404:
 *         description: Department not found
 *
 *   delete:
 *     summary: Delete department
 *     description: Deletes a department from the system
 *     tags:
 *       - Departments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *       404:
 *         description: Department not found
 */
router.route("/:id")
  .get((req, res, next) => manageDepartmentsController.getById(req, res, next))
  .put((req, res, next) => manageDepartmentsController.update(req, res, next))
  .delete((req, res, next) => manageDepartmentsController.delete(req, res, next));

// /api/departments/:id/doctors
/**
 * @swagger
 * /api/departments/{id}/doctors:
 *   get:
 *     summary: Get doctors by department
 *     description: Returns all doctors belonging to a specific department
 *     tags:
 *       - Departments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Doctors retrieved successfully
 *       404:
 *         description: Department not found
 */
router.get("/:id/doctors", (req, res, next) => manageDepartmentsController.getDoctors(req, res, next));

export default router;