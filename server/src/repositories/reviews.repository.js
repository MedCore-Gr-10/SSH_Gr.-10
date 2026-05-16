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