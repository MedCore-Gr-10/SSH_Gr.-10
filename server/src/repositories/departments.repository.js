import prisma from "../prisma.js";

class DepartmentsRepository {
  
  // ✅ 1. U hoq duplikimi. Kjo metodë tani është e pastër.
  async create(data) {
    return await prisma.departments.create({
      data,
    });
  }

  // ✅ 2. Metoda për listimin e të gjithave (E saktë)
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

  // ✅ 3. Rregulluar: findById tani numëron saktë doktorët përmes tabelës ndërmjetëse
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

  // ✅ 4. Metoda për kontrollin e emrit unik (E saktë)
  async findByName(name) {
    return await prisma.departments.findUnique({
      where: {
        department_name: name,
      },
    });
  }

  // ✅ 5. Rregulluar: Kjo metodë tani nxjerr saktë mjekët dhe futet thellë te profilet e tyre
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

  // ✅ 6. Ndryshuar id në Number(id) që të përputhet me tipin Int të PostgreSQL
  async update(id, data) {
    return await prisma.departments.update({
      where: { id: Number(id) },
      data,
    });
  }

  // ✅ 7. Ndryshuar id në Number(id) për fshirjen e sigurt
  async delete(id) {
    return await prisma.departments.delete({
      where: { id: Number(id) },
    });
  }

  // ✅ 8. Metoda shtesë që thirret te removeDepartment në Service-in tënd për të kontrolluar nëse ka mjekë para fshirjes
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