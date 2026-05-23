import express from "express";
import { JwtService } from "../utils/jwt.js";
import { AuthMiddleware } from "../middlewares/authMiddleware.js";
import { RoleMiddleware } from "../middlewares/roleMiddleware.js";
import PatientReviewsController from "../controllers/patient-controllers/reviews.controller.js";
import PatientEmergencyContactsController from "../controllers/patient-controllers/emergencyContacts.controller.js";
import PatientAllergiesController from "../controllers/patient-controllers/allergies.controller.js";
import PatientInsuranceController from "../controllers/patient-controllers/insurance.controller.js";

const router = express.Router();
const jwtService = new JwtService();
const authMiddleware = new AuthMiddleware(jwtService);
const roleMiddleware = new RoleMiddleware("patient", "PATIENT");
const reviewsController = new PatientReviewsController();
const emergencyContactsController = new PatientEmergencyContactsController();
const allergiesController = new PatientAllergiesController();
const insuranceController = new PatientInsuranceController();

router.use((req, res, next) => authMiddleware.handle(req, res, next));
router.use((req, res, next) => roleMiddleware.handle(req, res, next));

/**
 * @swagger
 * /api/patient/doctors:
 *   get:
 *     summary: Get doctors
 *     description: Returns available doctors for patients
 *     tags:
 *       - Patient Reviews
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctors retrieved successfully
 */
router.get("/doctors", (req, res, next) => reviewsController.getDoctors(req, res, next));
/**
 * @swagger
 * /api/patient/reviews:
 *   get:
 *     summary: Get patient reviews
 *     description: Returns all reviews created by the authenticated patient
 *     tags:
 *       - Patient Reviews
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 */
router.get("/reviews", (req, res, next) => reviewsController.getPatientReviews(req, res, next));
/**
 * @swagger
 * /api/patient/reviews:
 *   post:
 *     summary: Create review
 *     description: Creates a review for a doctor
 *     tags:
 *       - Patient Reviews
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctorId:
 *                 type: integer
 *                 example: 3
 *               rating:
 *                 type: integer
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Excellent doctor and very professional
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Bad request
 */
router.post("/reviews", (req, res, next) => reviewsController.createReview(req, res, next));
/**
 * @swagger
 * /api/patient/doctors/{doctorId}/reviews:
 *   get:
 *     summary: Get doctor reviews
 *     description: Returns reviews for a specific doctor
 *     tags:
 *       - Patient Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *       404:
 *         description: Doctor not found
 */
router.get("/doctors/:doctorId/reviews", (req, res, next) => reviewsController.getDoctorReviews(req, res, next));
/**
 * @swagger
 * /api/patient/reviews/{reviewId}:
 *   delete:
 *     summary: Delete review
 *     description: Deletes a patient review
 *     tags:
 *       - Patient Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       404:
 *         description: Review not found
 */
router.delete("/reviews/:reviewId", (req, res, next) => reviewsController.deleteReview(req, res, next));

/**
 * @swagger
 * /api/patient/emergency-contacts:
 *   get:
 *     summary: Get emergency contacts
 *     description: Returns patient emergency contacts
 *     tags:
 *       - Patient Emergency Contacts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Emergency contacts retrieved successfully
 */
router.get("/emergency-contacts", (req, res, next) => emergencyContactsController.listContacts(req, res, next));
/**
 * @swagger
 * /api/patient/emergency-contacts:
 *   post:
 *     summary: Create emergency contact
 *     description: Adds a new emergency contact
 *     tags:
 *       - Patient Emergency Contacts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Jane Doe
 *               relationship:
 *                 type: string
 *                 example: Sister
 *               phone:
 *                 type: string
 *                 example: "+38344111222"
 *     responses:
 *       201:
 *         description: Emergency contact created successfully
 */
router.post("/emergency-contacts", (req, res, next) => emergencyContactsController.createContact(req, res, next));
/**
 * @swagger
 * /api/patient/emergency-contacts/{contactId}/current:
 *   patch:
 *     summary: Set current emergency contact
 *     description: Marks an emergency contact as the primary contact
 *     tags:
 *       - Patient Emergency Contacts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: Current contact updated successfully
 */
router.patch(
  "/emergency-contacts/:contactId/current",
  (req, res, next) => emergencyContactsController.setCurrentContact(req, res, next)
);
/**
 * @swagger
 * /api/patient/emergency-contacts/{contactId}:
 *   delete:
 *     summary: Delete emergency contact
 *     description: Deletes an emergency contact
 *     tags:
 *       - Patient Emergency Contacts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: Emergency contact deleted successfully
 */
router.delete(
  "/emergency-contacts/:contactId",
  (req, res, next) => emergencyContactsController.deleteContact(req, res, next)
);

/**
 * @swagger
 * /api/patient/allergies:
 *   get:
 *     summary: Get allergies
 *     description: Returns patient allergies
 *     tags:
 *       - Patient Allergies
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Allergies retrieved successfully
 */
router.get("/allergies", (req, res, next) => allergiesController.listAllergies(req, res, next));
/**
 * @swagger
 * /api/patient/allergies:
 *   post:
 *     summary: Create allergy
 *     description: Adds a new allergy record
 *     tags:
 *       - Patient Allergies
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               allergy:
 *                 type: string
 *                 example: Penicillin
 *               severity:
 *                 type: string
 *                 example: High
 *     responses:
 *       201:
 *         description: Allergy added successfully
 */
router.post("/allergies", (req, res, next) => allergiesController.createAllergy(req, res, next));
/**
 * @swagger
 * /api/patient/allergies/{allergyId}:
 *   delete:
 *     summary: Delete allergy
 *     description: Deletes an allergy record
 *     tags:
 *       - Patient Allergies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: allergyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Allergy ID
 *     responses:
 *       200:
 *         description: Allergy deleted successfully
 */
router.delete("/allergies/:allergyId", (req, res, next) => allergiesController.deleteAllergy(req, res, next));

/**
 * @swagger
 * /api/patient/insurance:
 *   get:
 *     summary: Get insurance
 *     description: Returns patient insurance information
 *     tags:
 *       - Patient Insurance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Insurance retrieved successfully
 */
router.get("/insurance", (req, res, next) => insuranceController.getInsurance(req, res, next));
/**
 * @swagger
 * /api/patient/insurance:
 *   post:
 *     summary: Save insurance
 *     description: Creates or updates patient insurance information
 *     tags:
 *       - Patient Insurance
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:
 *                 type: string
 *                 example: Kosovo Health Insurance
 *               policyNumber:
 *                 type: string
 *                 example: INS-123456
 *               validUntil:
 *                 type: string
 *                 example: 2027-12-31
 *     responses:
 *       201:
 *         description: Insurance saved successfully
 */
router.post("/insurance", (req, res, next) => insuranceController.saveInsurance(req, res, next));
/**
 * @swagger
 * /api/patient/insurance/{insuranceId}:
 *   delete:
 *     summary: Delete insurance
 *     description: Deletes insurance information
 *     tags:
 *       - Patient Insurance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: insuranceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Insurance ID
 *     responses:
 *       200:
 *         description: Insurance deleted successfully
 */
router.delete("/insurance/:insuranceId", (req, res, next) => insuranceController.deleteInsurance(req, res, next));

export default router;
