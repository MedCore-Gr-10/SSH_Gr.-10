import prisma from "../prisma.js";

class ProfileRepository {
  async findAll() {
    return await prisma.profiles.findMany();
  }

  async findById(id) {
    return await prisma.profiles.findUnique({
      where: { id: Number(id) },
    });
  }
}

export default ProfileRepository;