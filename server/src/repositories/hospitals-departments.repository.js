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

  async findByHospitalAndDepartment(hospitalId, departmentId) {
    return prisma.hospitals_departments.findUnique({
      where: {
        hospital_id_department_id: {
          hospital_id: Number(hospitalId),
          department_id: Number(departmentId)
        }
      }
    });
  }

  async countStaffAssignments(hospitalId, departmentId) {
    return prisma.staff_hospitals_departments.count({
      where: {
        hospital_id: Number(hospitalId),
        department_id: Number(departmentId)
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
