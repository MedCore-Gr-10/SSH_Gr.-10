import DirectorAppointmentsTemplatesService from "../../services/director-services/appointmentsTemplates.services.js";

class AppointmentsTemplatesController {
  async listTemplates(req, res, next) {
    try {
      const templates = await DirectorAppointmentsTemplatesService.listTemplates(req.user.hospital_id, req.user.user_id);
      res.status(200).json({ success: true, data: templates });
    } catch (err) {
      next(err);
    }
  }

  async createTemplate(req, res, next) {
    try {
      const template = await DirectorAppointmentsTemplatesService.createTemplate(req.body, req.user.hospital_id, req.user.user_id);
      res.status(201).json({ success: true, data: template });
    } catch (err) {
      next(err);
    }
  }

  async updateTemplate(req, res, next) {
    try {
      const template = await DirectorAppointmentsTemplatesService.updateTemplate(req.params.id, req.body, req.user.hospital_id, req.user.user_id);
      res.status(200).json({ success: true, data: template });
    } catch (err) {
      next(err);
    }
  }

  async deleteTemplate(req, res, next) {
    try {
      const result = await DirectorAppointmentsTemplatesService.deleteTemplate(req.params.id, req.user.hospital_id, req.user.user_id);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export default AppointmentsTemplatesController;
