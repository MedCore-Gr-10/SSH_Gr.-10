import hospitalsRepository from "../../repositories/hospitals.repository.js";
import hospitalsDepartmentsRepository from "../../repositories/hospitals-departments.repository.js"; 

class HospitalsService {
  
  async createHospital(hospitalData) {
    const { hospital_name, hospital_address, email, director_personal_no, departments } = hospitalData;

    const directorProfile = await hospitalsRepository.findDirectorByPersonalNo(director_personal_no);

    if (!directorProfile || !directorProfile.users_profiles || directorProfile.users_profiles.length === 0) {
      throw new Error("Director with the provided personal number does not exist or does not have the 'director' role.");
    }

    const directorUserId = directorProfile.users_profiles[0].user_id;
    const assignedHospital = await hospitalsRepository.findHospitalByDirectorId(directorUserId);
    if (assignedHospital) {
      throw new Error(`Director is already assigned to ${assignedHospital.hospital_name}. A director can only be appointed to one hospital.`);
    }

    const newHospital = await hospitalsRepository.create({
      hospital_name,
      hospital_address,
      email,
      director_personal_no
    });

    if (departments && departments.length > 0) {
      const uniqueDepartmentIds = [...new Set(departments.map(Number))];

      for (const deptId of uniqueDepartmentIds) {
        await hospitalsDepartmentsRepository.upsert({
          hospital_id: newHospital.id,
          department_id: deptId
        });
      }
    }

    return this.getHospitalById(newHospital.id);
  }

  async getAllHospitals() {
    const hospitals = await hospitalsRepository.findAll();

    const mappedHospitals = await Promise.all(
      hospitals.map(async (hospital) => {
        const hospitalDepts = await hospitalsDepartmentsRepository.findByHospital(hospital.id);
        return {
          ...hospital,
          departments: hospitalDepts.map(hd => hd.departments)
        };
      })
    );

    return mappedHospitals;
  }

  async getHospitalById(id) {
    const hospital = await hospitalsRepository.findById(Number(id));
    if (!hospital) throw new Error("Hospital not found.");

    const hospitalDepts = await hospitalsDepartmentsRepository.findByHospital(Number(id));
    
    return {
      ...hospital,
      departments: hospitalDepts.map(hd => hd.departments)
    };
  }

  async updateHospital(id, data) {
    const hospitalId = Number(id);
    const existingHospital = await hospitalsRepository.findById(hospitalId);
    if (!existingHospital) {
      throw new Error("Hospital not found.");
    }

    if (data.director_personal_no && data.director_personal_no !== existingHospital.director?.personal_no) {
      const directorProfile = await hospitalsRepository.findDirectorByPersonalNo(data.director_personal_no);
      if (!directorProfile || !directorProfile.users_profiles || directorProfile.users_profiles.length === 0) {
        throw new Error("The new director personal number is invalid or not registered as a director.");
      }

      const directorUserId = directorProfile.users_profiles[0].user_id;
      const assignedHospital = await hospitalsRepository.findHospitalByDirectorId(directorUserId);
      if (assignedHospital && assignedHospital.id !== hospitalId) {
        throw new Error(`Director is already assigned to ${assignedHospital.hospital_name}. A director can only be appointed to one hospital.`);
      }
    }

    const { departments, ...basicHospitalData } = data;
    const updatedHospital = await hospitalsRepository.update(hospitalId, basicHospitalData);

    if (departments !== undefined) {
      const currentDeptsFromDb = await hospitalsDepartmentsRepository.findByHospital(hospitalId);
      const currentDeptIds = currentDeptsFromDb.map(hd => hd.department_id);

      const targetDeptIds = [...new Set(departments.map(Number))];

      const deptsToDelete = currentDeptIds.filter(id => !targetDeptIds.includes(id));
      for (const deptId of deptsToDelete) {
        const staffCount = await hospitalsDepartmentsRepository.countStaffAssignments(hospitalId, deptId);
        if (staffCount > 0) {
          throw new Error(`Cannot remove department ID ${deptId}. It currently has ${staffCount} staff members assigned.`);
        }
        await hospitalsDepartmentsRepository.delete(hospitalId, deptId);
      }

      const deptsToAdd = targetDeptIds.filter(id => !currentDeptIds.includes(id));
      for (const deptId of deptsToAdd) {
        await hospitalsDepartmentsRepository.upsert({
          hospital_id: hospitalId,
          department_id: deptId
        });
      }
    }

    return this.getHospitalById(hospitalId);
  }

  async deleteHospital(id) {
    const hospitalId = Number(id);
    const existingHospital = await hospitalsRepository.findById(hospitalId);
    if (!existingHospital) throw new Error("Hospital not found.");

    const currentDepts = await hospitalsDepartmentsRepository.findByHospital(hospitalId);
    for (const hd of currentDepts) {
      await hospitalsDepartmentsRepository.delete(hospitalId, hd.department_id);
    }
    
    return await hospitalsRepository.delete(hospitalId);
  }
}

export default new HospitalsService();
