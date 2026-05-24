import { Router } from "express";
import hospitalsController from "../controllers/superuser-controllers/hospital.controller.js";

const router = Router();

/**
 * @swagger
 * /api/hospitals:
 *   post:
 *     summary: Create hospital
 *     description: Creates a new hospital in the system
 *     tags:
 *       - Hospitals
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Regional Hospital Gjakova
 *               address:
 *                 type: string
 *                 example: Gjakove, Kosovo
 *               phone:
 *                 type: string
 *                 example: "+38344111222"
 *               email:
 *                 type: string
 *                 example: hospital@example.com
 *     responses:
 *       201:
 *         description: Hospital created successfully
 *       400:
 *         description: Bad request
 */
router.post("/", (req, res) => hospitalsController.create(req, res));
/**
 * @swagger
 * /api/hospitals:
 *   get:
 *     summary: Get all hospitals
 *     description: Returns all hospitals in the system
 *     tags:
 *       - Hospitals
 *     responses:
 *       200:
 *         description: Hospitals retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get("/", (req, res) => hospitalsController.findAll(req, res));
/**
 * @swagger
 * /api/hospitals/{id}:
 *   get:
 *     summary: Get hospital by ID
 *     description: Returns a specific hospital by its ID
 *     tags:
 *       - Hospitals
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Hospital ID
 *     responses:
 *       200:
 *         description: Hospital retrieved successfully
 *       404:
 *         description: Hospital not found
 */
router.get("/:id", (req, res) => hospitalsController.findById(req, res));
/**
 * @swagger
 * /api/hospitals/{id}:
 *   put:
 *     summary: Update hospital
 *     description: Updates an existing hospital
 *     tags:
 *       - Hospitals
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Hospital ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: University Clinical Center
 *               address:
 *                 type: string
 *                 example: Prishtine, Kosovo
 *               phone:
 *                 type: string
 *                 example: "+38349111222"
 *               email:
 *                 type: string
 *                 example: updatedhospital@example.com
 *     responses:
 *       200:
 *         description: Hospital updated successfully
 *       404:
 *         description: Hospital not found
 */
router.put("/:id", (req, res) => hospitalsController.update(req, res));
/**
 * @swagger
 * /api/hospitals/{id}:
 *   delete:
 *     summary: Delete hospital
 *     description: Deletes a hospital from the system
 *     tags:
 *       - Hospitals
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Hospital ID
 *     responses:
 *       200:
 *         description: Hospital deleted successfully
 *       404:
 *         description: Hospital not found
 */
router.delete("/:id", (req, res) => hospitalsController.delete(req, res));

export default router;