import express from "express";
import { JwtService } from "../utils/jwt.js";
import { AuthMiddleware } from "../middlewares/authMiddleware.js";
import { RoleMiddleware } from "../middlewares/roleMiddleware.js";
import PatientReviewsController from "../controllers/patient-controllers/reviews.controller.js";
import PatientEmergencyContactsController from "../controllers/patient-controllers/emergencyContacts.controller.js";
import PatientAllergiesController from "../controllers/patient-controllers/allergies.controller.js";
import PatientInsuranceController from "../controllers/patient-controllers/insurance.controller.js";
import PatientHospitalsController from "../controllers/patient-controllers/hospitals.controller.js";
import PatientAppointmentsController from "../controllers/patient-controllers/appointments.controller.js";

const router = express.Router();
const jwtService = new JwtService();
const authMiddleware = new AuthMiddleware(jwtService);
const roleMiddleware = new RoleMiddleware("patient", "PATIENT");
const reviewsController = new PatientReviewsController();
const emergencyContactsController = new PatientEmergencyContactsController();
const allergiesController = new PatientAllergiesController();
const insuranceController = new PatientInsuranceController();
const hospitalsController = new PatientHospitalsController();
const appointmentsController = new PatientAppointmentsController();

router.use((req, res, next) => authMiddleware.handle(req, res, next));
router.use((req, res, next) => roleMiddleware.handle(req, res, next));

router.get("/doctors", (req, res, next) => reviewsController.getDoctors(req, res, next));
router.get("/reviews", (req, res, next) => reviewsController.getPatientReviews(req, res, next));
router.post("/reviews", (req, res, next) => reviewsController.createReview(req, res, next));
router.get("/doctors/:doctorId/reviews", (req, res, next) => reviewsController.getDoctorReviews(req, res, next));
router.delete("/reviews/:reviewId", (req, res, next) => reviewsController.deleteReview(req, res, next));

router.get("/emergency-contacts", (req, res, next) => emergencyContactsController.listContacts(req, res, next));
router.post("/emergency-contacts", (req, res, next) => emergencyContactsController.createContact(req, res, next));
router.patch(
  "/emergency-contacts/:contactId/current",
  (req, res, next) => emergencyContactsController.setCurrentContact(req, res, next)
);
router.delete(
  "/emergency-contacts/:contactId",
  (req, res, next) => emergencyContactsController.deleteContact(req, res, next)
);

router.get("/allergies", (req, res, next) => allergiesController.listAllergies(req, res, next));
router.post("/allergies", (req, res, next) => allergiesController.createAllergy(req, res, next));
router.delete("/allergies/:allergyId", (req, res, next) => allergiesController.deleteAllergy(req, res, next));

router.get("/insurance", (req, res, next) => insuranceController.getInsurance(req, res, next));
router.post("/insurance", (req, res, next) => insuranceController.saveInsurance(req, res, next));
router.delete("/insurance/:insuranceId", (req, res, next) => insuranceController.deleteInsurance(req, res, next));

router.get("/hospitals", (req, res, next) => hospitalsController.listHospitals(req, res, next));
router.put("/hospitals", (req, res, next) => hospitalsController.updateSelectedHospitals(req, res, next));

/**
 * @swagger
 * /api/patient/appointments/filters:
 *   get:
 *     summary: Get appointment filter options
 *     description: Returns hospitals and specializations used by the patient appointment search UI.
 *     tags:
 *       - Patient Appointments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointment filter options returned successfully.
 */
router.get("/appointments/filters", (req, res, next) => appointmentsController.getFilters(req, res, next));

/**
 * @swagger
 * /api/patient/appointments/search:
 *   get:
 *     summary: Search available appointments for a patient
 *     description: Returns available, unbooked appointment slots filtered by the patient's selected hospital, doctor name, specialization, date, and time.
 *     tags:
 *       - Patient Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hospitalId
 *         schema:
 *           type: integer
 *         description: Selected hospital ID from the patient's care hospitals.
 *       - in: query
 *         name: doctorName
 *         schema:
 *           type: string
 *         description: Doctor first or last name search text.
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *         description: Doctor specialization name.
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Appointment date.
 *       - in: query
 *         name: time
 *         schema:
 *           type: string
 *         description: Slot start time or range, for example 08:00 or 08:00-08:30.
 *     responses:
 *       200:
 *         description: Available appointments returned successfully.
 */
router.get("/appointments/search", (req, res, next) => appointmentsController.searchAppointments(req, res, next));

export default router;
