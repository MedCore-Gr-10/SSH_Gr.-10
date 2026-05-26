import departmentsRepository from "../../repositories/departments.repository.js";

class ManageDepartmentsService {


  /**
   * Create a new department
   * @param {Object} data - { department_name: string }
   */
  async createDepartment(data) {
    if (!data.department_name || data.department_name.trim() === "") {
      throw new Error("Department name is required.");
    }

    const existing = await departmentsRepository.findByName(data.department_name.trim());
    if (existing) {
      throw new Error("A department with this name already exists.");
    }

    return await departmentsRepository.create({
      department_name: data.department_name.trim(),
    });
  }

  /**
   * Modify an existing department
   * @param {number|string} id - The ID of the department
   * @param {Object} data - { department_name: string }
   */
  async modifyDepartment(id, data) {
    if (!id) {
      throw new Error("Department ID is required for updating.");
    }

    const department = await departmentsRepository.findById(Number(id));
    if (!department) {
      throw new Error(`Department with ID ${id} not found.`);
    }

    const updatedData = {};

    if (data.department_name) {
      const trimmedName = data.department_name.trim();
      if (trimmedName === "") {
        throw new Error("Department name cannot be empty.");
      }

      const nameCheck = await departmentsRepository.findByName(trimmedName);
      if (nameCheck && nameCheck.id !== Number(id)) {
        throw new Error("Another department already uses this name.");
      }

      updatedData.department_name = trimmedName;
    }

    if (Object.keys(updatedData).length === 0) {
      return department;
    }

    return await departmentsRepository.update(Number(id), updatedData);
  }

  /**
   * Delete a department only if no staff/doctors are assigned to it 🗑️
   * @param {number|string} id - The ID of the department
   */
  async removeDepartment(id) {
    if (!id) {
      throw new Error("Department ID is required for deletion.");
    }

    const department = await departmentsRepository.findById(Number(id));
    if (!department) {
      throw new Error(`Department with ID ${id} not found.`);
    }

    const doctorCount = await departmentsRepository.countDoctors(id);

    if (doctorCount > 0) {
      throw new Error(`Cannot delete department. There are ${doctorCount} doctor(s) assigned to it.`);
    }

    return await departmentsRepository.delete(Number(id));
  }

  async getDoctorCountByDepartment(departmentId) {
    const department = await departmentsRepository.findById(Number(departmentId));
    if (!department) {
      throw new Error(`Department with ID ${departmentId} not found.`);
    }

    const count = await departmentsRepository.countDoctors(departmentId);
    
    return {
      department_id: department.id,
      department_name: department.department_name,
      total_doctors: count
    };
  }

  /**
   * Get all doctors assigned to a specific department
   * @param {number|string} departmentId
   */
  async getDoctorsByDepartment(departmentId) {
    const department = await departmentsRepository.findById(Number(departmentId));
    if (!department) {
      throw new Error(`Department with ID ${departmentId} not found.`);
    }

    const doctors = await departmentsRepository.findDoctorsByDepartment(Number(departmentId));

    return doctors.map(doc => ({
      doctor_id: doc.id,
      username: doc.user?.username || "N/A",
      first_name: doc.user?.profile?.first_name || "N/A",
      last_name: doc.user?.profile?.last_name || "N/A",
      phone_number: doc.user?.profile?.phone_number || "N/A",
    }));
  }

  async listDepartments() {
    const departments = await departmentsRepository.findAll();

    if (!departments || !Array.isArray(departments)) {
      return [];
    }

    return departments.map((dept) => {
      const hdList = dept.hospitals_departments || [];
      
      const totalDoctors = hdList.reduce((sum, hd) => {
        return sum + (hd._count?.staff_hospitals_departments || 0);
      }, 0);

      return {
        id: dept.id,
        department_name: dept.department_name,
        total_doctors: totalDoctors, 
      };
    });
  }

  async listDepartments() {
  const departments = await departmentsRepository.findAll();

  if (!departments || !Array.isArray(departments)) {
    return [];
  }

  return departments.map((dept) => {
    const hdList = dept.hospitals_departments || [];
    
    const totalHospitals = hdList.length;

    const totalDoctors = hdList.reduce((sum, hd) => {
      return sum + (hd._count?.staff_hospitals_departments || 0);
    }, 0);

    return {
      id: dept.id,
      department_name: dept.department_name,
      total_doctors: totalDoctors,
      total_hospitals: totalHospitals, 
    };
  });
}


async getHospitalsByDepartment(departmentId) {
  const relations = await departmentsRepository.findHospitalsByDepartment(departmentId);
  return relations.map(rel => ({
    hospital_id: rel.hospitals?.id,
    hospital_name: rel.hospitals?.hospital_name || "N/A",
    hospital_address: rel.hospitals?.hospital_address || "N/A",
    email: rel.hospitals?.email || "N/A",
  }));
}
}

export default ManageDepartmentsService;