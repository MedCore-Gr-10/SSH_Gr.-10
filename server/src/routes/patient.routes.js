import express from "express";
import { JwtService } from "../utils/jwt.js";
import { AuthMiddleware } from "../middlewares/authMiddleware.js";
import { RoleMiddleware } from "../middlewares/roleMiddleware.js";
import PatientReviewsController from "../controllers/patient-controllers/reviews.controller.js";
import PatientEmergencyContactsController from "../controllers/patient-controllers/emergencyContacts.controller.js";

const router = express.Router();
const jwtService = new JwtService();
const authMiddleware = new AuthMiddleware(jwtService);
const roleMiddleware = new RoleMiddleware("patient", "PATIENT");
const reviewsController = new PatientReviewsController();
const emergencyContactsController = new PatientEmergencyContactsController();

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

export default router;
