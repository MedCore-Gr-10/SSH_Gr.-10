import prisma from "../prisma.js";

class InsuranceRepository {

  async create(data) {
    return prisma.insurance.create({
      data
    });
  }

  async findProfileInsurance(profileId) {
    return prisma.insurance.findMany({
      where: {
        profile_id: profileId
      },
      orderBy: {
        id: "desc"
      }
    });
  }

  async findCurrentProfileInsurance(profileId) {
    return prisma.insurance.findFirst({
      where: {
        profile_id: profileId
      },
      orderBy: {
        id: "desc"
      }
    });
  }

  async findProfileInsuranceById(profileId, insuranceId) {
    return prisma.insurance.findFirst({
      where: {
        id: Number(insuranceId),
        profile_id: profileId
      }
    });
  }

  async update(id, data) {
    return prisma.insurance.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return prisma.insurance.delete({
      where: { id }
    });
  }

}

export default new InsuranceRepository();
