import appointmentsMadeRepository from "../../repositories/appointments-made.repository.js";

class DoctorPatientsController {
  async getPatients(req, res, next) {
    try {
      const doctorId = req.user.user_id;
      const patients = await appointmentsMadeRepository.findDoctorPatients(doctorId);

      res.status(200).json({ success: true, data: patients });
    } catch (err) {
      next(err);
    }
  }
}

export default DoctorPatientsController;
