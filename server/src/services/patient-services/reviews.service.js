import reviewsRepository from "../../repositories/reviews.repository.js";
import userRepository from "../../repositories/user.repository.js";

class PatientReviewsService {
  formatDoctor(user) {
    const profile = user.users_profiles?.[0]?.profiles;

    return {
      id: user.id,
      username: user.username,
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
    };
  }

  async getDoctors() {
    const doctors = await userRepository.findDoctors();
    return doctors.map((doctor) => this.formatDoctor(doctor));
  }

  async createReview(patientId, data) {
    const { doctor_id, rating, comment } = data;
    const parsedRating = Number(rating);

    if (!patientId) {
      throw new Error("Patient ID is required");
    }

    if (!doctor_id) {
      throw new Error("Doctor is required");
    }

    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      throw new Error("Rating must be a whole number between 1 and 5");
    }

    if (!comment?.trim()) {
      throw new Error("Comment is required");
    }

    const existingReview = await reviewsRepository.findPatientDoctorReview(patientId, doctor_id);
    if (existingReview) {
      throw new Error("You have already reviewed this doctor");
    }

    return reviewsRepository.create({
      patient_id: patientId,
      doctor_id,
      rating: parsedRating,
      comment: comment.trim(),
    });
  }

  async getPatientReviews(patientId) {
    return reviewsRepository.findPatientReviews(patientId);
  }

  async getDoctorReviews(doctorId) {
    return reviewsRepository.findDoctorReviews(doctorId);
  }

  async deleteReview(patientId, reviewId) {
    const reviews = await reviewsRepository.findPatientReviews(patientId);
    const review = reviews.find((item) => item.id === Number(reviewId));

    if (!review) {
      throw new Error("Review not found");
    }

    await reviewsRepository.delete(Number(reviewId));
    return { id: Number(reviewId) };
  }
}

export default new PatientReviewsService();
