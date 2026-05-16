import prisma from "../prisma.js";

class HospitalsRepository {

  async create(data) {
    return prisma.hospitals.create({
      data
    });
  }

  async findAll() {
    return prisma.hospitals.findMany();
  }

  async findById(id) {
    return prisma.hospitals.findUnique({
      where: { id }
    });
  }

  async update(id, data) {
    return prisma.hospitals.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return prisma.hospitals.delete({
      where: { id }
    });
  }

}

export default new HospitalsRepository();