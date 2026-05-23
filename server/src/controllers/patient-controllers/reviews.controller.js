import PatientReviewsService from "../../services/patient-services/reviews.service.js";

class PatientReviewsController {
  async getDoctors(req, res, next) {
    try {
      const doctors = await PatientReviewsService.getDoctors();
      res.status(200).json({ success: true, data: doctors });
    } catch (err) {
      next(err);
    }
  }

  async createReview(req, res, next) {
    try {
      const review = await PatientReviewsService.createReview(req.user.user_id, req.body);
      res.status(201).json({ success: true, data: review });
    } catch (err) {
      next(err);
    }
  }

  async getPatientReviews(req, res, next) {
    try {
      const reviews = await PatientReviewsService.getPatientReviews(req.user.user_id);
      res.status(200).json({ success: true, data: reviews });
    } catch (err) {
      next(err);
    }
  }

  async getDoctorReviews(req, res, next) {
    try {
      const reviews = await PatientReviewsService.getDoctorReviews(req.params.doctorId);
      res.status(200).json({ success: true, data: reviews });
    } catch (err) {
      next(err);
    }
  }

  async deleteReview(req, res, next) {
    try {
      const deletedReview = await PatientReviewsService.deleteReview(req.user.user_id, req.params.reviewId);
      res.status(200).json({ success: true, data: deletedReview });
    } catch (err) {
      next(err);
    }
  }
}

export default PatientReviewsController;
