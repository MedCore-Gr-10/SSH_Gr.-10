import prisma from "../prisma.js";

class ReviewsRepository {

  async create(data) {
    return prisma.reviews.create({
      data
    });
  }

  async findDoctorReviews(doctorId) {
    return prisma.reviews.findMany({
      where: {
        doctor_id: doctorId
      },
      include: {
        users_reviews_patient_idTousers: {
          include: {
            users_profiles: {
              include: {
                profiles: true
              }
            }
          }
        }
      }
    });
  }

  async findPatientReviews(patientId) {
    return prisma.reviews.findMany({
      where: {
        patient_id: patientId
      },
      include: {
        users_reviews_doctor_idTousers: {
          include: {
            users_profiles: {
              include: {
                profiles: true
              }
            }
          }
        }
      }
    });
  }

  async findPatientDoctorReview(patientId, doctorId) {
    return prisma.reviews.findUnique({
      where: {
        patient_id_doctor_id: {
          patient_id: patientId,
          doctor_id: doctorId
        }
      }
    });
  }

  async delete(id) {
    return prisma.reviews.delete({
      where: { id }
    });
  }

}

export default new ReviewsRepository();
