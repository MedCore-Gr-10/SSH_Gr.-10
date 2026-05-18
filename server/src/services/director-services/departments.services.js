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

  async createDepartment(data, hospitalId, currentUserId) {
    const { department_name } = data;
    if (!department_name) throw new Error("Department name required");

    // Use transaction to ensure idempotent create + link
    const result = await prisma.$transaction(async (tx) => {
      // try to find existing department by name (case-insensitive)
      const existing = await tx.departments.findFirst({
        where: { department_name: { equals: department_name, mode: "insensitive" } },
      });

      let dept;
      if (existing) {
        dept = existing;
      } else {
        dept = await tx.departments.create({ data: { department_name } });
      }

      // ensure hospital link exists
      const link = await tx.hospitals_departments.findFirst({
        where: { hospital_id: hospitalId, department_id: dept.id },
      });

      if (!link) {
        await tx.hospitals_departments.create({ data: { hospital_id: hospitalId, department_id: dept.id } });
      }

      // return the department record
      return dept;
    });

    await logsRepository.create({
      user_id: currentUserId,
      action: "create department",
      reason: "Director created or linked a department (transaction)",
    });

    return result;
  }

  async updateDepartment(id, data, hospitalId, currentUserId) {
    const dept = await departmentsRepository.findById(Number(id));
    if (!dept) throw new Error("Department not found");

    const updated = await departmentsRepository.update(Number(id), data);

    await logsRepository.create({
      user_id: currentUserId,
      action: "update department",
      reason: "Director updated department",
    });

    return updated;
  }

  async deleteDepartment(id, hospitalId, currentUserId) {
    // remove hospital link first
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
