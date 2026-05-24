import prisma from "../prisma.js";

// 1. E kthejmë nga objekt në Klasë duke përdorur fjalën kyçe "class"
export class StaffDepartmentsRepository {
  
  // 2. Heqim dypikat (:) dhe presjet (,) që përdoren në objekte, dhe i lëmë si metoda të pastra klase
  
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
  }

  // Gjen të gjitha relacionet e departamenteve për një anëtar stafi
  async replaceStaffDepartment(data) {
    const staffId = data.staff_id;
    const hospitalId = Number(data.hospital_id);
    const departmentId = Number(data.department_id);

    return prisma.$transaction(async (tx) => {
      await tx.staff_specializations.deleteMany({
        where: { staff_id: staffId },
      });

      await tx.staff_hospitals_departments.deleteMany({
        where: { staff_id: staffId },
      });

      return tx.staff_hospitals_departments.create({
        data: {
          staff_id: staffId,
          hospital_id: hospitalId,
          department_id: departmentId,
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
    });
  }

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
  }

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
  }

  // Numëron sa mjekë/staf ka një departament në një spital të caktuar
  async countStaffInDepartment(hospitalId, departmentId) {
    return await prisma.staff_hospitals_departments.count({
      where: {
        hospital_id: Number(hospitalId),
        department_id: Number(departmentId),
      },
    });
  }
} // Mbyllja e klasës

// 3. Tani kjo linjë funksionon në mënyrë perfekte dhe pa asnjë gabim! 🚀
export default new StaffDepartmentsRepository();