import DirectorDepartmentsService from "../../services/director-services/departments.services.js";

class DepartmentsController {
  async getDepartments(req, res, next) {
    try {
      const depts = await DirectorDepartmentsService.listHospitalDepartments(
        req.user.hospital_id,
        req.user.user_id
      );
      res.status(200).json({ success: true, data: depts });
    } catch (err) {
      next(err);
    }
  }

  async createDepartment(req, res, next) {
    try {
      const dept = await DirectorDepartmentsService.createDepartment(
        req.body,
        req.user.hospital_id,
        req.user.user_id
      );
      res.status(201).json({ success: true, data: dept });
    } catch (err) {
      next(err);
    }
  }

  async updateDepartment(req, res, next) {
    try {
      const dept = await DirectorDepartmentsService.updateDepartment(
        req.params.id,
        req.body,
        req.user.hospital_id,
        req.user.user_id
      );
      res.status(200).json({ success: true, data: dept });
    } catch (err) {
      next(err);
    }
  }

  async deleteDepartment(req, res, next) {
    try {
      await DirectorDepartmentsService.deleteDepartment(
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

export default DepartmentsController;
