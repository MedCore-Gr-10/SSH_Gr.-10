import PatientInsuranceService from "../../services/patient-services/insurance.service.js";

class PatientInsuranceController {
  async getInsurance(req, res, next) {
    try {
      const insurance = await PatientInsuranceService.getInsurance(req.user.user_id);
      res.status(200).json({ success: true, data: insurance });
    } catch (err) {
      next(err);
    }
  }

  async saveInsurance(req, res, next) {
    try {
      const insurance = await PatientInsuranceService.saveInsurance(req.user.user_id, req.body);
      res.status(200).json({ success: true, data: insurance });
    } catch (err) {
      next(err);
    }
  }

  async deleteInsurance(req, res, next) {
    try {
      const insurance = await PatientInsuranceService.deleteInsurance(
        req.user.user_id,
        req.params.insuranceId
      );
      res.status(200).json({ success: true, data: insurance });
    } catch (err) {
      next(err);
    }
  }
}

export default PatientInsuranceController;
