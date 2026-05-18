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
}

export default ManageSpecializationsService;