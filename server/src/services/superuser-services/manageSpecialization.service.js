import specializationsRepository from "../../repositories/specializations.repository.js";

class ManageSpecializationsService {
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

      const nameCheck = await specializationsRepository.findByName(trimmedName);
      if (nameCheck && nameCheck.id !== parseInt(id, 10)) {
        throw new Error("Another specialization already uses this name.");
      }

      updatedData.specialization_name = trimmedName;
    }

    if (Object.keys(updatedData).length === 0) {
      return specialization; 
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

    const specialization = await specializationsRepository.findById(id);
    if (!specialization) {
      throw new Error(`Specialization with ID ${id} not found.`);
    }

    const doctorCount = await specializationsRepository.countDoctors(id);

    if (doctorCount > 0) {
      throw new Error(`Cannot delete specialization. There are ${doctorCount} doctor(s) assigned to it.`);
    }

    return await specializationsRepository.delete(id);
  }

  async getDoctorCountBySpecialization(specializationId) {
    const specialization = await specializationsRepository.findById(specializationId);
    if (!specialization) {
      throw new Error(`Specialization with ID ${specializationId} not found.`);
    }

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

  const doctors = await specializationsRepository.findDoctorsBySpecialization(specializationId);

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