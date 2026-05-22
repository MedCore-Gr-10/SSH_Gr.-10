import express from "express";
import ManageSpecializationsController from "../controllers/superuser-controllers/manageSpecialization.controller.js";

const router = express.Router();
const manageSpecializationsController = new ManageSpecializationsController();

// GET /api/specializations
/**
 * @swagger
 * /api/specializations:
 *   get:
 *     summary: Get all specializations
 *     description: Returns all medical specializations
 *     tags:
 *       - Specializations
 *     responses:
 *       200:
 *         description: Specializations retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get("/", (req, res, next) =>
  manageSpecializationsController.getAll(req, res, next)
);

// POST /api/specializations
/**
 * @swagger
 * /api/specializations:
 *   post:
 *     summary: Create specialization
 *     description: Creates a new medical specialization
 *     tags:
 *       - Specializations
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
 *                 example: Medical specialty focused on heart diseases
 *     responses:
 *       201:
 *         description: Specialization created successfully
 *       400:
 *         description: Bad request
 */
router.post("/", (req, res, next) =>
  manageSpecializationsController.create(req, res, next)
);

// PUT /api/specializations/:id
/**
 * @swagger
 * /api/specializations/{id}:
 *   put:
 *     summary: Update specialization
 *     description: Updates an existing medical specialization
 *     tags:
 *       - Specializations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Specialization ID
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
 *                 example: Specialty focused on the nervous system
 *     responses:
 *       200:
 *         description: Specialization updated successfully
 *       404:
 *         description: Specialization not found
 */
router.put("/:id", (req, res, next) =>
  manageSpecializationsController.update(req, res, next)
);

// DELETE /api/specializations/:id
/**
 * @swagger
 * /api/specializations/{id}:
 *   delete:
 *     summary: Delete specialization
 *     description: Deletes a medical specialization from the system
 *     tags:
 *       - Specializations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Specialization ID
 *     responses:
 *       200:
 *         description: Specialization deleted successfully
 *       404:
 *         description: Specialization not found
 */
router.delete("/:id", (req, res, next) =>
  manageSpecializationsController.delete(req, res, next)
);

export default router;