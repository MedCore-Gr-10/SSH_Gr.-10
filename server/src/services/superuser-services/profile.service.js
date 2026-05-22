import profileRepository from "../../repositories/profile.repository.js";

class ProfileService {

  async getAllProfiles() {
    const profiles = await profileRepository.findAll();
    return profiles.map(profile => ({
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      birth_date: profile.birth,
      gender: profile.gender,
      personal_no: profile.personal_no,
      phone_number: profile.phone_number,
    }));
  }

  async getProfileById(id) {
    return await profileRepository.findById(id);
  }

  async getProfileByPersonalNo(personalNo) {
    if (!personalNo || personalNo.trim() === "") {
      throw new Error("Personal Number is required for searching.");
    }

    const profile = await profileRepository.findByPersonalNo(personalNo.trim());
    if (!profile) return null;

    return {
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      personal_no: profile.personal_no,
      phone_number: profile.phone_number
    };
  }

  async createProfile(profileData) {
    const { first_name, last_name, birth, gender, personal_no, phone_number } = profileData;

    if (!first_name || !last_name || !personal_no) {
      throw new Error("First name, Last name, and Personal Number are required.");
    }

    const existingProfile = await profileRepository.findByPersonalNo(personal_no);
    if (existingProfile) {
      throw new Error("A profile with this Personal Number already exists.");
    }

    let formattedBirth = birth ? new Date(birth) : null;

    const newProfile = await profileRepository.create({
      first_name,
      last_name,
      birth: formattedBirth,
      gender: gender || null,
      personal_no,
      phone_number: phone_number || null,
    });

    return {
      id: newProfile.id,
      first_name: newProfile.first_name,
      last_name: newProfile.last_name,
      birth_date: newProfile.birth,
      gender: newProfile.gender,
      personal_no: newProfile.personal_no,
      phone_number: newProfile.phone_number,
    };
  }

  async searchProfilesByName(name) {
    if (!name || name.trim() === "") {
      return this.getAllProfiles(); 
    }

    const profiles = await profileRepository.searchByName(name.trim());
    return profiles.map(profile => ({
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      birth_date: profile.birth,
      gender: profile.gender,
      personal_no: profile.personal_no,
      phone_number: profile.phone_number,
    }));
  }

  async updateProfile(id, profileData) {
    const { first_name, last_name, birth, gender, phone_number } = profileData;

    const existingProfile = await profileRepository.findById(id);
    if (!existingProfile) {
      throw new Error("Profile not found.");
    }

    if (first_name !== undefined && !first_name.trim()) {
      throw new Error("First name cannot be empty.");
    }
    if (last_name !== undefined && !last_name.trim()) {
      throw new Error("Last name cannot be empty.");
    }

    let formattedBirth = birth !== undefined ? (birth ? new Date(birth) : null) : undefined;

    const updatedProfile = await profileRepository.update(id, {
      first_name: first_name !== undefined ? first_name : undefined,
      last_name: last_name !== undefined ? last_name : undefined,
      birth: formattedBirth,
      gender: gender !== undefined ? (gender || null) : undefined,
      phone_number: phone_number !== undefined ? (phone_number || null) : undefined,
    });

    return {
      id: updatedProfile.id,
      first_name: updatedProfile.first_name,
      last_name: updatedProfile.last_name,
      birth_date: updatedProfile.birth,
      gender: updatedProfile.gender,
      personal_no: updatedProfile.personal_no,
      phone_number: updatedProfile.phone_number,
    };
  }

  // ✅ NEW METHOD: Verifies and passes operation to repository layer
  async deleteProfile(id) {
    const existingProfile = await profileRepository.findById(id);
    if (!existingProfile) {
      throw new Error("Profile not found.");
    }
    return await profileRepository.delete(id);
  }
}

export default ProfileService;