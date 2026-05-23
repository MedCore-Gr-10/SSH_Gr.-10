// staff-specializations.repository.js
import { prisma } from './prisma.js'; // Përshtat rrugën ku keni iniciuar PrismaClient

export const StaffSpecializationsRepository = {
  // I cakton një specializim një mjeku në një spital dhe departament specifik
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
  },

  // Gjen të gjitha specializimet e një mjeku për një vend të caktuar pune
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
  },

  // Heq një specializim specifik nga mjeku (përdor çelësin e përbërë me 4 fusha)
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
};