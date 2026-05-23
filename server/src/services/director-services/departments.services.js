import prisma from "../../prisma.js";
import departmentsRepository from "../../repositories/departments.repository.js";
import hospitalsDepartmentsRepository from "../../repositories/hospitals-departments.repository.js";
import logsRepository from "../../repositories/logs.repository.js";

class DirectorDepartmentsService {
  async listHospitalDepartments(hospitalId, currentUserId) {
    if (!hospitalId) throw new Error("Hospital ID required");

    const records = await hospitalsDepartmentsRepository.findByHospital(hospitalId);

    await logsRepository.create({
      user_id: currentUserId,
      action: "view departments",
      reason: "Director listed hospital departments",
    });

    return records.map((r) => r.departments);
  }

  async listDepartmentCatalog(hospitalId, currentUserId) {
    if (!hospitalId) throw new Error("Hospital ID required");

    const records = await prisma.departments.findMany({
      include: {
        hospitals_departments: {
          where: { hospital_id: Number(hospitalId) },
          include: {
            _count: {
              select: { staff_hospitals_departments: true },
            },
          },
        },
      },
      orderBy: { department_name: "asc" },
    });

    await logsRepository.create({
      user_id: currentUserId,
      action: "view department catalog",
      reason: "Director listed global departments with hospital activation state",
    });

    return records.map((department) => {
      const hospitalLink = department.hospitals_departments[0];

      return {
        id: department.id,
        department_name: department.department_name,
        is_active: Boolean(hospitalLink),
        staff_count: hospitalLink?._count?.staff_hospitals_departments ?? 0,
      };
    });
  }

  async activateDepartment(data, hospitalId, currentUserId) {
    const departmentId = Number(data.department_id ?? data.id);
    if (!departmentId) throw new Error("Department ID required");

    const dept = await departmentsRepository.findById(departmentId);
    if (!dept) throw new Error("Department not found");

    const existingLink = await hospitalsDepartmentsRepository.findByHospitalAndDepartment(
      hospitalId,
      departmentId
    );

    if (!existingLink) {
      await hospitalsDepartmentsRepository.create({
        hospital_id: Number(hospitalId),
        department_id: departmentId,
      });
    }

    await logsRepository.create({
      user_id: currentUserId,
      action: "activate department",
      reason: "Director activated existing department for hospital",
    });

    return dept;
  }

  async deleteDepartment(id, hospitalId, currentUserId) {
    const link = await hospitalsDepartmentsRepository.findByHospitalAndDepartment(
      hospitalId,
      Number(id)
    );
    if (!link) throw new Error("Department is not active in this hospital");

    const staffCount = await hospitalsDepartmentsRepository.countStaffAssignments(
      hospitalId,
      Number(id)
    );
    if (staffCount > 0) {
      throw new Error(
        `Cannot deactivate department while ${staffCount} staff member(s) are assigned to it.`
      );
    }

    await hospitalsDepartmentsRepository.delete(hospitalId, Number(id));

    await logsRepository.create({
      user_id: currentUserId,
      action: "unlink department",
      reason: "Director unlinked department from hospital",
    });

    return { id };
  }
}

export default new DirectorDepartmentsService();
