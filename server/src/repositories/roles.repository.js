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

  async findByName(roleNames) {
    return prisma.roles.findFirst({
      where: {
        role_name: {
          in: roleNames,
        },
      },
    });
  }

}

export default new RolesRepository();