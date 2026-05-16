import prisma from "../prisma.js";

class DepartmentsRepository {

  async create(data) {
    return prisma.departments.create({
      data
    });
  }

  async findAll() {
    return prisma.departments.findMany();
  }

  async findById(id) {
    return prisma.departments.findUnique({
      where: { id }
    });
  }

  async update(id, data) {
    return prisma.departments.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return prisma.departments.delete({
      where: { id }
    });
  }

}

export default new DepartmentsRepository();