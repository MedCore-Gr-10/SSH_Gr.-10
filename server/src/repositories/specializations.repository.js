import prisma from "../prisma.js";

class SpecializationsRepository {
  // Create a new specialization
  async create(data) {
    return prisma.specializations.create({
      data,
    });
  }

  // Get all specializations
  async findAll() {
    return prisma.specializations.findMany({
      orderBy: {
        specialization_name: 'asc' // Optional: keeps lists sorted alphabetically
      }
    });
  }

  // Find a unique specialization by its ID
  async findById(id) {
    return prisma.specializations.findUnique({
      where: { id: parseInt(id, 10) },
    });
  }

  // Find a specialization by name (useful for avoiding duplicates)
  async findByName(name) {
    return prisma.specializations.findUnique({
      where: { specialization_name: name },
    });
  }

  // Update an existing specialization
  async update(id, data) {
    return prisma.specializations.update({
      where: { id: parseInt(id, 10) },
      data,
    });
  }
}

export default new SpecializationsRepository();