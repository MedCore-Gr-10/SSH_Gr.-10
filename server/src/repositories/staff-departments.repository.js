// staff-departments.repository.js
import { prisma } from './prisma.js'; // Përshtat rrugën ku keni iniciuar PrismaClient

export const StaffDepartmentsRepository = {
  // Shton një anëtar të stafit në një spital dhe departament specifik
  async assignStaffToDepartment(data) {
    return await prisma.staff_hospitals_departments.create({
      data: {
        staff_id: data.staff_id,
        hospital_id: Number(data.hospital_id),
        department_id: Number(data.department_id),
      },
      include: {
        hospitals_departments: {
          include: {
            departments: true,
            hospitals: true,
          },
        },
      },
    });
  },

  // Gjen të gjitha relacionet e departamenteve për një anëtar stafi
  async findDepartmentsByStaffId(staffId) {
    return await prisma.staff_hospitals_departments.findMany({
      where: { staff_id: staffId },
      include: {
        hospitals_departments: {
          include: {
            departments: true,
            hospitals: true,
          },
        },
      },
    });
  },

  // Largon stafin nga një departament dhe spital i caktuar (përdor çelësin e përbërë)
  async removeStaffFromDepartment(staffId, hospitalId, departmentId) {
    return await prisma.staff_hospitals_departments.delete({
      where: {
        staff_id_hospital_id_department_id: {
          staff_id: staffId,
          hospital_id: Number(hospitalId),
          department_id: Number(departmentId),
        },
      },
    });
  },

  // Numëron sa mjekë/staf ka një departament në një spital të caktuar
  async countStaffInDepartment(hospitalId, departmentId) {
    return await prisma.staff_hospitals_departments.count({
      where: {
        hospital_id: Number(hospitalId),
        department_id: Number(departmentId),
      },
    });
  }
};