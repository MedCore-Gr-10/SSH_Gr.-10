import PatientHospitalsService from "../../services/patient-services/hospitals.service.js";

class PatientHospitalsController {
  async listHospitals(req, res, next) {
    try {
      const hospitals = await PatientHospitalsService.listHospitals(req.user.user_id);
      res.status(200).json({ success: true, data: hospitals });
    } catch (err) {
      next(err);
    }
  }

  async updateSelectedHospitals(req, res, next) {
    try {
      const hospitals = await PatientHospitalsService.updateSelectedHospitals(
        req.user.user_id,
        req.body
      );
      res.status(200).json({ success: true, data: hospitals });
    } catch (err) {
      next(err);
    }
  }
}

export default PatientHospitalsController;
