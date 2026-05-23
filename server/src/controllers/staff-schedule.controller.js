import DirectorStaffScheduleService from "../services/director-services/staffSchedule.services.js";

class StaffScheduleController {
  async getStaffSchedules(req, res, next) {
    try {
      const schedules = await DirectorStaffScheduleService.getRelevantSchedules(
        req.user.user_id,
        req.user.hospital_id,
        req.user.role,
        req.user.user_id
      );
      res.status(200).json({ success: true, data: schedules });
    } catch (err) {
      next(err);
    }
  }
}

export default StaffScheduleController;
