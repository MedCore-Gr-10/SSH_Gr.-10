import DirectorPatientService from "../../services/director-services/patient.services.js";

class PatientController {
  async getPatients(req, res, next) {
    try {
      const patients = await DirectorPatientService.getHospitalPatients(
        req.user.hospital_id,
        req.user.user_id
      );

      res.status(200).json({ success: true, data: patients });
    } catch (err) {
      next(err);
    }
  }

  async createPatient(req, res, next) {
    try {
      const patient = await DirectorPatientService.createPatient(
        req.body,
        req.user.hospital_id,
        req.user.user_id
      );

      res.status(201).json({ success: true, data: patient });
    } catch (err) {
      next(err);
    }
  }

  async updatePatient(req, res, next) {
    try {
      const patient = await DirectorPatientService.updatePatient(
        req.params.id,
        req.body,
        req.user.hospital_id,
        req.user.user_id
      );

      res.status(200).json({ success: true, data: patient });
    } catch (err) {
      next(err);
    }
  }

  async deletePatient(req, res, next) {
    try {
      await DirectorPatientService.deletePatient(
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

export default PatientController;
