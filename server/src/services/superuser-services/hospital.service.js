import hospitalsRepository from "../../repositories/hospitals.repository.js";

class HospitalsService {
  
  // 1. Krijimi i Spitalit
  async createHospital(hospitalData) {
    const { hospital_name, hospital_address, email, director_personal_no } = hospitalData;

    // Verifiko nëse profili i drejtorit ekziston në sistem
    const directorProfile = await hospitalsRepository.findDirectorByPersonalNo(director_personal_no);

    // Kujdes: kontrollon nëse users_profiles është e zbrazët (në rast se roli nuk përputhet)
    if (!directorProfile || !directorProfile.users_profiles || directorProfile.users_profiles.length === 0) {
      throw new Error("Director with the provided personal number does not exist or does not have the 'director' role.");
    }

    // Tani ia kalojmë të gjitha të dhënat (përfshirë edhe director_personal_no) repository-t
    return await hospitalsRepository.create({
      hospital_name,
      hospital_address,
      email,
      director_personal_no // Duhet kaluar këtu që repository ta lidhë në DB
    });
  }

  // 2. Marrja e të gjithë spitaleve (vijnë të mapuar me 'director' nga repository)
  async getAllHospitals() {
    return await hospitalsRepository.findAll();
  }

  // 3. Marrja e një spitali sipas ID
  async getHospitalById(id) {
    const hospital = await hospitalsRepository.findById(Number(id));
    if (!hospital) throw new Error("Hospital not found.");
    return hospital;
  }

  // 4. Përditësimi i Spitalit (Update)
  async updateHospital(id, data) {
    // Kontrollojmë nëse spitali ekziston fillimisht
    const existingHospital = await hospitalsRepository.findById(Number(id));
    if (!existingHospital) {
      throw new Error("Hospital not found.");
    }

    // Nëse në payload vjen një 'director_personal_no' i ri (përdoruesi ka bërë "Verify & Replace")
    if (data.director_personal_no && data.director_personal_no !== existingHospital.director?.personal_no) {
      const directorProfile = await hospitalsRepository.findDirectorByPersonalNo(data.director_personal_no);
      
      if (!directorProfile || !directorProfile.users_profiles || directorProfile.users_profiles.length === 0) {
        throw new Error("The new director personal number is invalid or not registered as a director.");
      }
    }

    // Ekzekutojmë update-in në repository
    return await hospitalsRepository.update(Number(id), data);
  }

  // 5. Fshirja e Spitalit
  async deleteHospital(id) {
    const existingHospital = await hospitalsRepository.findById(Number(id));
    if (!existingHospital) throw new Error("Hospital not found.");
    
    return await hospitalsRepository.delete(Number(id));
  }
}

export default new HospitalsService();