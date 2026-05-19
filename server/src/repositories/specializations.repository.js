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
      specialization_name: 'asc'
    },
    // 🌟 ADD THIS BLOCK HERE: Tells Prisma to ask Postgres for the count
    include: {
      _count: {
        select: {
          staff_specializations: true // Counts how many doctors have this spec
        }
      }
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

 async countDoctors(specializationId) {
  const count = await prisma.staff_specializations.count({
    where: {
      specialization_id: parseInt(specializationId, 10),
      // Drill down through the relations to check the actual user role 🛡️
      staff_hospitals_departments: {
        users: {
          roles: {
            role_name: "Doctor" // Or use role_id: 2
          }
        }
      }
    }
  });

  return count;
}
}

export default new SpecializationsRepository();