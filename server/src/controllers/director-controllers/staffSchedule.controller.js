import DirectorStaffScheduleService from "../../services/director-services/staffSchedule.services.js";

class StaffScheduleController {
  async getStaffSchedules(req, res, next) {
    try {
      const schedules = await DirectorStaffScheduleService.getHospitalSchedules(
        req.user.hospital_id,
        req.user.user_id
      );
      res.status(200).json({ success: true, data: schedules });
    } catch (err) {
      next(err);
    }
  }

  async createStaffSchedule(req, res, next) {
    try {
      const schedule = await DirectorStaffScheduleService.createSchedule(
        req.body,
        req.user.hospital_id,
        req.user.user_id
      );
      res.status(201).json({ success: true, data: schedule });
    } catch (err) {
      next(err);
    }
  }

  async updateStaffSchedule(req, res, next) {
    try {
      const schedule = await DirectorStaffScheduleService.updateSchedule(
        req.params.id,
        req.body,
        req.user.hospital_id,
        req.user.user_id
      );
      res.status(200).json({ success: true, data: schedule });
    } catch (err) {
      next(err);
    }
  }

  async deleteStaffSchedule(req, res, next) {
    try {
      await DirectorStaffScheduleService.deleteSchedule(
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

export default StaffScheduleController;
