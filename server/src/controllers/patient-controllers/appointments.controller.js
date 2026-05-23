import PatientAppointmentsService from "../../services/patient-services/appointments.service.js";

class PatientAppointmentsController {
  async getFilters(req, res, next) {
    try {
      const filters = await PatientAppointmentsService.getAppointmentFilters();
      res.status(200).json({ success: true, data: filters });
    } catch (err) {
      next(err);
    }
  }

  async searchAppointments(req, res, next) {
    try {
      const appointments = await PatientAppointmentsService.searchAppointments(
        req.user.user_id,
        req.query
      );
      res.status(200).json({ success: true, data: appointments });
    } catch (err) {
      next(err);
    }
  }
}

export default PatientAppointmentsController;
