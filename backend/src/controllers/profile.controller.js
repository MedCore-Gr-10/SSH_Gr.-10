import ProfileService from "../services/profile.service.js";

class ProfileController {
  constructor() {
    this.profileService = new ProfileService();
  }

  async getAllProfiles(req, res, next) {
    try {
      const profiles = await this.profileService.getAllProfiles();

      res.status(200).json({
        success: true,
        data: profiles,
      });
    } catch (err) {
      next(err);
    }
  }

  async getProfileById(req, res, next) {
    try {
      const profile = await this.profileService.getProfileById(req.params.id);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default ProfileController;