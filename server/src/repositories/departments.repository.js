import prisma from "../prisma.js";

class DepartmentsRepository {
  
  async create(data) {
    return await prisma.departments.create({
      data,
    });
  }

  async findAll() {
    return await prisma.departments.findMany({
      include: {
        hospitals_departments: {
          include: {
            _count: {
              select: {
                staff_hospitals_departments: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });
  }

  async findById(id) {
    const department = await prisma.departments.findUnique({
      where: { id: Number(id) },
      include: {
        hospitals_departments: {
          include: {
            _count: {
              select: { staff_hospitals_departments: true },
            },
          },
        },
      },
    });

    return department;
  }

  async findByName(name) {
    return await prisma.departments.findUnique({
      where: {
        department_name: name,
      },
    });
  }

  async findDoctorsByDepartment(departmentId) {
    return await prisma.staff_hospitals_departments.findMany({
      where: { department_id: Number(departmentId) },
      include: {
        users: {
          include: {
            users_profiles: {
              include: {
                profiles: true
              }
            }
          }
        }
      }
    });
  }


  async update(id, data) {
    return await prisma.departments.update({
      where: { id: Number(id) },
      data,
    });
  }

  async delete(id) {
    return await prisma.departments.delete({
      where: { id: Number(id) },
    });
  }

  
  async countDoctors(departmentId) {
    const relations = await prisma.staff_hospitals_departments.findMany({
      where: { department_id: Number(departmentId) },
    });
    return relations.length;
  }

  async findHospitalsByDepartment(departmentId) {
  return await prisma.hospitals_departments.findMany({
    where: { department_id: Number(departmentId) },
    include: {
      hospitals: true
    }
  });
}

}

export default new DepartmentsRepository();