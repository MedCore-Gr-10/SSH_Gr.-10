import hospitalsService from "../../services/superuser-services/hospital.service.js";

class HospitalsController {
  
  create = async (req, res) => {
    try {
      const hospital = await hospitalsService.createHospital(req.body);
      return res.status(201).json({ success: true, data: hospital });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  findAll = async (req, res) => {
    try {
      const hospitals = await hospitalsService.getAllHospitals();
      return res.status(200).json({ success: true, data: hospitals });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  findById = async (req, res) => {
    try {
      const hospital = await hospitalsService.getHospitalById(req.params.id);
      return res.status(200).json({ success: true, data: hospital });
    } catch (error) {
      return res.status(404).json({ success: false, message: error.message });
    }
  };

  update = async (req, res) => {
    try {
      const { id } = req.params;
      
      if (req.body.director_personal_no === "") {
        delete req.body.director_personal_no;
      }

      const updated = await hospitalsService.updateHospital(id, req.body);
      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  delete = async (req, res) => {
    try {
      await hospitalsService.deleteHospital(req.params.id);
      return res.status(200).json({ success: true, message: "Hospital deleted successfully." });
    } catch (error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(400).json({ success: false, message: error.message });
    }
  };
}

export default new HospitalsController();