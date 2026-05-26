import prisma from "../prisma.js";

class SpecializationsRepository {
  // Create a new specialization
  async create(data) {
    return prisma.specializations.create({
      data,
    });
  }

  async findAll() {
  return prisma.specializations.findMany({
    orderBy: {
      specialization_name: 'asc'
    },
    include: {
      _count: {
        select: {
          staff_specializations: true 
        }
      }
    }
  });
}

  async findById(id) {
    return prisma.specializations.findUnique({
      where: { id: parseInt(id, 10) },
    });
  }


  async findByName(name) {
    return prisma.specializations.findUnique({
      where: { specialization_name: name },
    });
  }

  async update(id, data) {
    return prisma.specializations.update({
      where: { id: parseInt(id, 10) },
      data,
    });
  }

  async delete(id) {
    return prisma.specializations.delete({
      where: { id: parseInt(id, 10) },
    });
  }

 async countDoctors(specializationId) {
  const count = await prisma.staff_specializations.count({
    where: {
      specialization_id: parseInt(specializationId, 10),
      staff_hospitals_departments: {
        users: {
          roles: {
            role_name: "Doctor" 
          }
        }
      }
    }
  });

  return count;
}

  async findDoctorsBySpecialization(specializationId) {
    return prisma.staff_specializations.findMany({
      where: { specialization_id: parseInt(specializationId, 10) },
      include: {
        staff_hospitals_departments: {
          include: {
            users: {
              include: {
                profile: true
              }
            }
          }
        }
      }
    }).then(records => 
      records.map(r => ({
        id: r.staff_hospitals_departments?.users?.id,
        user: r.staff_hospitals_departments?.users
      }))
    );
  }
}

export default new SpecializationsRepository();