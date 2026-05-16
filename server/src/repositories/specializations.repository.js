import prisma from "../prisma.js";

class SpecializationsRepository {

  async create(data) {
    return prisma.specializations.create({
      data
    });
  }

  async findAll() {
    return prisma.specializations.findMany();
  }

}

export default new SpecializationsRepository();