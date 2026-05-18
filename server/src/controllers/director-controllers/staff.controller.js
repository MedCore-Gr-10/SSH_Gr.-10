import DirectorStaffService from "../../services/director-services/staff.services.js";

class StaffController {
  async getStaff(req, res, next) {
    try {
      const staff = await DirectorStaffService.getHospitalStaff(
        req.user.hospital_id,
        req.user.user_id
      );
      res.status(200).json({ success: true, data: staff });
    } catch (err) {
      next(err);
    }
  }

  async createStaff(req, res, next) {
    try {
      const staff = await DirectorStaffService.createStaff(
        req.body,
        req.user.hospital_id,
        req.user.user_id
      );
      res.status(201).json({ success: true, data: staff });
    } catch (err) {
      next(err);
    }
  }

  async updateStaff(req, res, next) {
    try {
      const staff = await DirectorStaffService.updateStaff(
        req.params.id,
        req.body,
        req.user.hospital_id,
        req.user.user_id
      );
      res.status(200).json({ success: true, data: staff });
    } catch (err) {
      next(err);
    }
  }

  async deleteStaff(req, res, next) {
    try {
      await DirectorStaffService.deleteStaff(
        req.params.id,
        req.user.hospital_id,
        req.user.user_id
      );
      res.status(200).json({ success: true, data: { id: req.params.id } });
    } catch (err) {
      next(err);
    }
  }
}

export default StaffController;
