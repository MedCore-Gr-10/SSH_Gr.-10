import specializationsRepository from "../../repositories/specializations.repository.js";

class ManageSpecializationsService {
  /**
   * List all specializations
   */
  async listSpecializations() {
    return await specializationsRepository.findAll();
  }

  /**
   * Create a new specialization
   * @param {Object} data - { specialization_name: string }
   */
  async createSpecialization(data) {
    if (!data.specialization_name || data.specialization_name.trim() === "") {
      throw new Error("Specialization name is required.");
    }

    // Check if specialization name already exists (since it's marked @unique in schema)
    const existing = await specializationsRepository.findByName(data.specialization_name.trim());
    if (existing) {
      throw new Error("A specialization with this name already exists.");
    }

    return await specializationsRepository.create({
      specialization_name: data.specialization_name.trim(),
    });
  }

  /**
   * Modify an existing specialization
   * @param {number|string} id - The ID of the specialization
   * @param {Object} data - { specialization_name: string }
   */
  async modifySpecialization(id, data) {
    if (!id) {
      throw new Error("Specialization ID is required for updating.");
    }

    // Verify the record exists
    const specialization = await specializationsRepository.findById(id);
    if (!specialization) {
      throw new Error(`Specialization with ID ${id} not found.`);
    }

    const updatedData = {};

    if (data.specialization_name) {
      const trimmedName = data.specialization_name.trim();
      if (trimmedName === "") {
        throw new Error("Specialization name cannot be empty.");
      }

      // Check if another record already uses this name
      const nameCheck = await specializationsRepository.findByName(trimmedName);
      if (nameCheck && nameCheck.id !== parseInt(id, 10)) {
        throw new Error("Another specialization already uses this name.");
      }

      updatedData.specialization_name = trimmedName;
    }

    // Perform the update if there is anything to change
    if (Object.keys(updatedData).length === 0) {
      return specialization; // Return unmodified object if fields are identical/empty
    }

    return await specializationsRepository.update(id, updatedData);
  }

  /**
   * Delete a specialization only if no doctors are assigned to it 🗑️
   * @param {number|string} id - The ID of the specialization
   */
  async removeSpecialization(id) {
    if (!id) {
      throw new Error("Specialization ID is required for deletion.");
    }

    // 1. Kontrollojmë nëse ky specializim ekziston fare në databazë
    const specialization = await specializationsRepository.findById(id);
    if (!specialization) {
      throw new Error(`Specialization with ID ${id} not found.`);
    }

    // 2. Marrim numrin e doktorëve të lidhur me këtë specializim
    const doctorCount = await specializationsRepository.countDoctors(id);

    // 3. Nëse ka doktorë të caktuar (numri > 0), bllokojmë fshirjen
    if (doctorCount > 0) {
      throw new Error(`Cannot delete specialization. There are ${doctorCount} doctor(s) assigned to it.`);
    }

    // 4. Nëse numri është zero, kryejmë fshirjen e sigurt
    return await specializationsRepository.delete(id);
  }

  async getDoctorCountBySpecialization(specializationId) {
    // Rregulluar: u ndryshua nga shkronja e madhe në të vogël që të përputhet me importin
    const specialization = await specializationsRepository.findById(specializationId);
    if (!specialization) {
      throw new Error(`Specialization with ID ${specializationId} not found.`);
    }

    // Rregulluar: u ndryshua nga shkronja e madhe në të vogël që të përputhet me importin
    const count = await specializationsRepository.countDoctors(specializationId);
    
    return {
      specialization_id: specialization.id,
      specialization_name: specialization.specialization_name,
      total_doctors: count
    };
  }
  /**
 * Get all doctors assigned to a specific specialization with their profile and user details
 * @param {number|string} specializationId
 */
async getDoctorsBySpecialization(specializationId) {
  // 1. Kontrollojmë nëse specializimi ekziston
  const specialization = await specializationsRepository.findById(specializationId);
  if (!specialization) {
    throw new Error(`Specialization with ID ${specializationId} not found.`);
  }

  // 2. Marrim doktorët nga repozitori (Prisma përgjithësisht i kthen me include: { user: { include: { profile: true } } })
  // Nëse repozitori juaj nuk ka një metodë të tillë, sigurohuni që query të bëjë join/include tabelat User dhe Profile.
  const doctors = await specializationsRepository.findDoctorsBySpecialization(specializationId);

  // 3. Mapojmë të dhënat në një format të pastër për frontend-in
  return doctors.map(doc => ({
    doctor_id: doc.id,
    username: doc.user?.username || "N/A",
    first_name: doc.user?.profile?.first_name || "N/A",
    last_name: doc.user?.profile?.last_name || "N/A",
    phone_number: doc.user?.profile?.phone_number || "N/A",
  }));
}
}

export default ManageSpecializationsService;