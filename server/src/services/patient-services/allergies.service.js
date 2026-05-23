import allergiesRepository from "../../repositories/allergies.repository.js";
import profileRepository from "../../repositories/profile.repository.js";

const allergyTypes = ["Food", "Medication", "Environmental", "Insect", "Latex", "Other"];
const severityLevels = ["Mild", "Moderate", "Severe", "Life-threatening"];

class PatientAllergiesService {
  formatAllergy(allergy) {
    return {
      id: allergy.id,
      name: allergy.allergy_name,
      type: allergy.allergy_type,
      reaction: allergy.reaction_symptoms,
      severity: allergy.severity,
    };
  }

  async getPatientProfile(userId) {
    const profileLink = await profileRepository.findUserProfile(userId);
    if (!profileLink?.profiles) {
      throw new Error("Patient profile not found");
    }
    return profileLink.profiles;
  }

  validateAllergy(data) {
    const name = data.name?.trim();
    const type = data.type?.trim();
    const reaction = data.reaction?.trim();
    const severity = data.severity?.trim();

    if (!name || !type || !reaction || !severity) {
      throw new Error("Please fill in all allergy fields");
    }

    if (!allergyTypes.includes(type)) {
      throw new Error("Invalid allergy type");
    }

    if (!severityLevels.includes(severity)) {
      throw new Error("Invalid allergy severity");
    }

    return { name, type, reaction, severity };
  }

  async listAllergies(patientId) {
    const profile = await this.getPatientProfile(patientId);
    const allergies = await allergiesRepository.findByProfileId(profile.id);
    return allergies.map((allergy) => this.formatAllergy(allergy));
  }

  async createAllergy(patientId, data) {
    const profile = await this.getPatientProfile(patientId);
    const allergyData = this.validateAllergy(data);
    const existingAllergy = await allergiesRepository.findProfileAllergy(profile.id, allergyData.name);

    if (existingAllergy) {
      throw new Error("This allergy is already in your list");
    }

    const allergy = await allergiesRepository.create({
      profile_id: profile.id,
      allergy_name: allergyData.name,
      allergy_type: allergyData.type,
      reaction_symptoms: allergyData.reaction,
      severity: allergyData.severity,
    });

    return this.formatAllergy(allergy);
  }

  async deleteAllergy(patientId, allergyId) {
    const profile = await this.getPatientProfile(patientId);
    const allergy = await allergiesRepository.findProfileAllergyById(profile.id, allergyId);

    if (!allergy) {
      throw new Error("Allergy not found");
    }

    await allergiesRepository.delete(allergy.id);
    return { id: allergy.id };
  }
}

export default new PatientAllergiesService();
