import PatientAppointmentsService from "../../services/patient-services/appointments.service.js";

class PatientAppointmentsController {
  async getFilters(req, res, next) {
    try {
      const filters = await PatientAppointmentsService.getAppointmentFilters(req.user.user_id);
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

  async getBookedAppointments(req, res, next) {
    try {
      const appointments = await PatientAppointmentsService.getBookedAppointments(req.user.user_id);
      res.status(200).json({ success: true, data: appointments });
    } catch (err) {
      next(err);
    }
  }

  async getPatientRecords(req, res, next) {
    try {
      const records = await PatientAppointmentsService.getPatientRecords(req.user.user_id);
      res.status(200).json({ success: true, data: records });
    } catch (err) {
      next(err);
    }
  }

  async getStaffSchedules(req, res, next) {
    try {
      const schedules = await PatientAppointmentsService.getPatientStaffSchedules(req.user.user_id);
      res.status(200).json({ success: true, data: schedules });
    } catch (err) {
      next(err);
    }
  }

  async bookAppointment(req, res, next) {
    try {
      const appointment = await PatientAppointmentsService.bookAppointment(
        req.user.user_id,
        req.params.slotId
      );
      res.status(201).json({ success: true, data: appointment });
    } catch (err) {
      next(err);
    }
  }

  async cancelAppointment(req, res, next) {
    try {
      const result = await PatientAppointmentsService.cancelAppointment(
        req.user.user_id,
        req.params.appointmentId
      );
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export default PatientAppointmentsController;
