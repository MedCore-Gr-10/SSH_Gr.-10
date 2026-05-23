import ManageDepartmentsService from "../../services/superuser-services/manageDepartments.service.js";

const departmentsService = new ManageDepartmentsService();

class ManageDepartmentsController {
  create = async (req, res, next) => {
    try {
      const newDept = await departmentsService.createDepartment(req.body);
      res.status(201).json({ success: true, data: newDept });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  getAll = async (req, res, next) => {
    try {
      // ✅ Thërret Service-in i cili do të merret me llogaritjen e mjekëve
      const data = await departmentsService.listDepartments();
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getById = async (req, res, next) => {
    try {
      const data = await departmentsService.getDoctorCountByDepartment(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  };

  getDoctors = async (req, res, next) => {
    try {
      const data = await departmentsService.getDoctorsByDepartment(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedDept = await departmentsService.modifyDepartment(id, req.body);
      res.status(200).json({ success: true, data: updatedDept });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      await departmentsService.removeDepartment(id);
      res.status(200).json({ success: true, message: "Department deleted successfully." });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  getHospitals = async (req, res, next) => {
  try {
    const data = await departmentsService.getHospitalsByDepartment(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// *Sigurohu që e ke regjistruar këtë rrugë te router-i yt: router.get("/:id/hospitals", controller.getHospitals)*
}

export default ManageDepartmentsController;