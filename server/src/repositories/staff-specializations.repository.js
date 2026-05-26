import prisma from "../prisma.js";

export class StaffSpecializationsRepository {
  
  async addSpecializationToStaff(data) {
    return await prisma.staff_specializations.create({
      data: {
        staff_id: data.staff_id,
        hospital_id: Number(data.hospital_id),
        department_id: Number(data.department_id),
        specialization_id: Number(data.specialization_id),
      },
      include: {
        specializations: true,
      },
    });
  }


  async replaceStaffSpecialization(data) {
    const staffId = data.staff_id;
    const hospitalId = Number(data.hospital_id);
    const departmentId = Number(data.department_id);
    const specializationId = data.specialization_id ? Number(data.specialization_id) : null;

    return prisma.$transaction(async (tx) => {
      await tx.staff_specializations.deleteMany({
        where: { staff_id: staffId },
      });

      if (!specializationId) {
        return null;
      }

      return tx.staff_specializations.create({
        data: {
          staff_id: staffId,
          hospital_id: hospitalId,
          department_id: departmentId,
          specialization_id: specializationId,
        },
        include: {
          specializations: true,
        },
      });
    });
  }

  async findSpecializationsByStaffLocation(staffId, hospitalId, departmentId) {
    return await prisma.staff_specializations.findMany({
      where: {
        staff_id: staffId,
        hospital_id: Number(hospitalId),
        department_id: Number(departmentId),
      },
      include: {
        specializations: true,
      },
    });
  }

  async removeSpecializationFromStaff(staffId, hospitalId, departmentId, specializationId) {
    return await prisma.staff_specializations.delete({
      where: {
        staff_id_hospital_id_department_id_specialization_id: {
          staff_id: staffId,
          hospital_id: Number(hospitalId),
          department_id: Number(departmentId),
          specialization_id: Number(specializationId),
        },
      },
    });
  }
}

export default new StaffSpecializationsRepository();