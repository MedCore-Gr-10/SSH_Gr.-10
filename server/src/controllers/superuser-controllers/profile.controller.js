import ProfileService from "../../services/superuser-services/profile.service.js";

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

  async createProfile(req, res, next) {
    try {
      const newProfile = await this.profileService.createProfile(req.body);
      res.status(201).json({
        success: true,
        message: "Profile created successfully",
        data: newProfile,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { id } = req.params;
      const updatedProfile = await this.profileService.updateProfile(id, req.body);
      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedProfile,
      });
    } catch (err) {
      next(err);
    }
  }

  async getByPersonalNo(req, res, next) {
    try {
      const { personal_no } = req.params;
      const profile = await this.profileService.getProfileByPersonalNo(personal_no);
      
      if (!profile) {
        return res.status(404).json({ 
          success: false, 
          message: "Ky numër personal nuk ekziston në sistem." 
        });
      }

      return res.status(200).json({ 
        success: true, 
        data: profile 
      });
    } catch (err) {
      next(err);
    }
  }

  // ✅ FIXED: Calls service layer instead of direct undefined prisma execution
  async deleteProfile(req, res, next) {
    try {
      const { id } = req.params;
      const deletedProfile = await this.profileService.deleteProfile(id);

      return res.status(200).json({ 
        success: true, 
        message: "Profile deleted successfully!",
        data: deletedProfile 
      });
    } catch (error) {
      next(error); 
    }
  }
}

export default ProfileController;