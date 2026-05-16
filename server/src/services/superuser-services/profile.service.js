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
}

export default ProfileService;