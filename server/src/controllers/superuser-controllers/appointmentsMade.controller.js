import AppointmentsMadeService from "../../services/superuser-services/appointmentsMade.service.js";

class AppointmentsMadeController {
  async listAll(req, res) {
    try {
      const appointments = await AppointmentsMadeService.getAllAppointments();
      return res.status(200).json(appointments);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching appointments", error: error.message });
    }
  }
}

export default new AppointmentsMadeController();