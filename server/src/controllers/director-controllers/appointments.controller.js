import DirectorAppointmentsService from "../../services/director-services/appointments.services.js";

class AppointmentsController {
  async getAppointments(req, res, next) {
    try {
      const appointments = await DirectorAppointmentsService.getHospitalAppointments(
        req.user.hospital_id,
        req.user.user_id
      );
      res.status(200).json({ success: true, data: appointments });
    } catch (err) {
      next(err);
    }
  }

  async getAppointmentSlots(req, res, next) {
    try {
      const slots = await DirectorAppointmentsService.getHospitalSlots(
        req.user.hospital_id,
        req.user.user_id
      );
      res.status(200).json({ success: true, data: slots });
    } catch (err) {
      next(err);
    }
  }

  async updateAppointment(req, res, next) {
    try {
      const appointment = await DirectorAppointmentsService.updateAppointment(
        req.params.id,
        req.body,
        req.user.hospital_id,
        req.user.user_id
      );
      res.status(200).json({ success: true, data: appointment });
    } catch (err) {
      next(err);
    }
  }

  async deleteAppointment(req, res, next) {
    try {
      await DirectorAppointmentsService.deleteAppointment(
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

export default AppointmentsController;
