import hospitalsRepository from "../../repositories/hospitals.repository.js";
import hospitalsDepartmentsRepository from "../../repositories/hospitals-departments.repository.js"; 

class HospitalsService {
  
  // 1. Krijimi i Spitalit dhe Lidhja e Departamenteve
  async createHospital(hospitalData) {
    const { hospital_name, hospital_address, email, director_personal_no, departments } = hospitalData;

    // Verifiko nëse profili i drejtorit ekziston në sistem
    const directorProfile = await hospitalsRepository.findDirectorByPersonalNo(director_personal_no);

    if (!directorProfile || !directorProfile.users_profiles || directorProfile.users_profiles.length === 0) {
      throw new Error("Director with the provided personal number does not exist or does not have the 'director' role.");
    }

    // 1. Krijojmë spitalin në tabelën e spitaleve
    const newHospital = await hospitalsRepository.create({
      hospital_name,
      hospital_address,
      email,
      director_personal_no
    });

    // 2. Lidhim departamentet duke përdorur repository-n tënd (create)
    if (departments && departments.length > 0) {
      for (const deptId of departments) {
        await hospitalsDepartmentsRepository.create({
          hospital_id: newHospital.id,
          department_id: Number(deptId)
        });
      }
    }

    // Kthejmë spitalin bashkë me departamentet e sapolidhura
    return this.getHospitalById(newHospital.id);
  }

  // 2. Marrja e të gjithë spitaleve (të mapuar me departamentet përkatëse)
  async getAllHospitals() {
    const hospitals = await hospitalsRepository.findAll();

    // Për çdo spital, marrim departamentet nga repository yt i ri
    const mappedHospitals = await Promise.all(
      hospitals.map(async (hospital) => {
        const hospitalDepts = await hospitalsDepartmentsRepository.findByHospital(hospital.id);
        return {
          ...hospital,
          // Mapojmë strukturën që frontend-i të lexojë direkt array-n .departments
          departments: hospitalDepts.map(hd => hd.departments)
        };
      })
    );

    return mappedHospitals;
  }

  // 3. Marrja e një spitali sipas ID (me departamente)
  async getHospitalById(id) {
    const hospital = await hospitalsRepository.findById(Number(id));
    if (!hospital) throw new Error("Hospital not found.");

    // Marrim departamentet nga repository yt
    const hospitalDepts = await hospitalsDepartmentsRepository.findByHospital(Number(id));
    
    return {
      ...hospital,
      departments: hospitalDepts.map(hd => hd.departments)
    };
  }

  // 4. Përditësimi i Spitalit (Sinkronizimi i Checkbox-eve)
  async updateHospital(id, data) {
    const hospitalId = Number(id);
    const existingHospital = await hospitalsRepository.findById(hospitalId);
    if (!existingHospital) {
      throw new Error("Hospital not found.");
    }

    // Verifikimi i drejtorit nëse ka ndryshuar
    if (data.director_personal_no && data.director_personal_no !== existingHospital.director?.personal_no) {
      const directorProfile = await hospitalsRepository.findDirectorByPersonalNo(data.director_personal_no);
      if (!directorProfile || !directorProfile.users_profiles || directorProfile.users_profiles.length === 0) {
        throw new Error("The new director personal number is invalid or not registered as a director.");
      }
    }

    // 1. Përditësojmë të dhënat bazë të spitalit
    const { departments, ...basicHospitalData } = data;
    const updatedHospital = await hospitalsRepository.update(hospitalId, basicHospitalData);

    // 2. Nëse në payload vijnë departamentet (nga checkbox-et e frontend-it)
    if (departments !== undefined) {
      const currentDeptsFromDb = await hospitalsDepartmentsRepository.findByHospital(hospitalId);
      const currentDeptIds = currentDeptsFromDb.map(hd => hd.department_id);

      const targetDeptIds = departments.map(Number);

      // A. Gjejmë cilat duhen fshirë (ishin në DB por nuk u dërguan nga frontend)
      const deptsToDelete = currentDeptIds.filter(id => !targetDeptIds.includes(id));
      for (const deptId of deptsToDelete) {
        // Kontrollojmë nëse ka staf të alokuar para fshirjes që mos të shkatërrojmë të dhënat
        const staffCount = await hospitalsDepartmentsRepository.countStaffAssignments(hospitalId, deptId);
        if (staffCount > 0) {
          throw new Error(`Cannot remove department ID ${deptId}. It currently has ${staffCount} staff members assigned.`);
        }
        await hospitalsDepartmentsRepository.delete(hospitalId, deptId);
      }

      // B. Gjejmë cilat duhen shtuar (janë përzgjedhur në frontend por nuk ishin në DB)
      const deptsToAdd = targetDeptIds.filter(id => !currentDeptIds.includes(id));
      for (const deptId of deptsToAdd) {
        await hospitalsDepartmentsRepository.create({
          hospital_id: hospitalId,
          department_id: deptId
        });
      }
    }

    return this.getHospitalById(hospitalId);
  }

  // 5. Fshirja e Spitalit
  async deleteHospital(id) {
    const hospitalId = Number(id);
    const existingHospital = await hospitalsRepository.findById(hospitalId);
    if (!existingHospital) throw new Error("Hospital not found.");

    // Fshijmë të gjitha lidhjet e departamenteve të këtë spitali nga tabela ndërmjetëse
    const currentDepts = await hospitalsDepartmentsRepository.findByHospital(hospitalId);
    for (const hd of currentDepts) {
      await hospitalsDepartmentsRepository.delete(hospitalId, hd.department_id);
    }
    
    return await hospitalsRepository.delete(hospitalId);
  }
}

export default new HospitalsService();