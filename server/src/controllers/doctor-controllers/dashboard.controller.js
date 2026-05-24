import doctorDashboardService from "../../services/doctor-services/dashboard.service.js";
import logsRepository from "../../repositories/logs.repository.js";

class DoctorDashboardController {
  async getDashboard(req, res, next) {
    try {
      const doctorId = req.user.user_id;

      const dashboard =
        await doctorDashboardService.getDashboard(doctorId);

      await logsRepository.create({
        user_id: doctorId,
        action: "view dashboard",
        reason: "Doctor viewed dashboard overview",
      });

      res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default DoctorDashboardController;