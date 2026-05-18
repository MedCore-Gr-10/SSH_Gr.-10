import prisma from "../prisma.js";

class HospitalsDepartmentsRepository {

  async create(data) {
    return prisma.hospitals_departments.create({
      data
    });
  }

  async findByHospital(hospitalId) {
    return prisma.hospitals_departments.findMany({
      where: { hospital_id: hospitalId },
      include: {
        departments: true
      }
    });
  }

  async delete(hospitalId, departmentId) {
    return prisma.hospitals_departments.delete({
      where: {
        hospital_id_department_id: {
          hospital_id: hospitalId,
          department_id: departmentId
        }
      }
    });
  }

}

export default new HospitalsDepartmentsRepository();
