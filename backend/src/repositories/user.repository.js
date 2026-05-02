import prisma from "../prisma.js";

class UserRepository {
  async findAll() {
    return await prisma.users.findMany();
  }

  async findById(id) {
    return await prisma.users.findUnique({
      where: { id: Number(id) },
    });
  }
}

export default UserRepository;