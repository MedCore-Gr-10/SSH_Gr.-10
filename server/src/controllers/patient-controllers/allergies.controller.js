import PatientAllergiesService from "../../services/patient-services/allergies.service.js";

class PatientAllergiesController {
  async listAllergies(req, res, next) {
    try {
      const allergies = await PatientAllergiesService.listAllergies(req.user.user_id);
      res.status(200).json({ success: true, data: allergies });
    } catch (err) {
      next(err);
    }
  }

  async createAllergy(req, res, next) {
    try {
      const allergy = await PatientAllergiesService.createAllergy(req.user.user_id, req.body);
      res.status(201).json({ success: true, data: allergy });
    } catch (err) {
      next(err);
    }
  }

  async deleteAllergy(req, res, next) {
    try {
      const allergy = await PatientAllergiesService.deleteAllergy(req.user.user_id, req.params.allergyId);
      res.status(200).json({ success: true, data: allergy });
    } catch (err) {
      next(err);
    }
  }
}

export default PatientAllergiesController;
