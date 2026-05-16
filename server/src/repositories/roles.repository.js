import prisma from "../prisma.js";

class RolesRepository {

  async create(data) {
    return prisma.roles.create({
      data
    });
  }

  async findAll() {
    return prisma.roles.findMany();
  }

  async findById(id) {
    return prisma.roles.findUnique({
      where: { id }
    });
  }

}

export default new RolesRepository();