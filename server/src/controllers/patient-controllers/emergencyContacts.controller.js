import PatientEmergencyContactsService from "../../services/patient-services/emergencyContacts.service.js";

class PatientEmergencyContactsController {
  async listContacts(req, res, next) {
    try {
      const contacts = await PatientEmergencyContactsService.listContacts(req.user.user_id);
      res.status(200).json({ success: true, data: contacts });
    } catch (err) {
      next(err);
    }
  }

  async createContact(req, res, next) {
    try {
      const contact = await PatientEmergencyContactsService.createContact(req.user.user_id, req.body);
      res.status(201).json({ success: true, data: contact });
    } catch (err) {
      next(err);
    }
  }

  async setCurrentContact(req, res, next) {
    try {
      const contact = await PatientEmergencyContactsService.setCurrentContact(
        req.user.user_id,
        req.params.contactId
      );
      res.status(200).json({ success: true, data: contact });
    } catch (err) {
      next(err);
    }
  }

  async deleteContact(req, res, next) {
    try {
      const contact = await PatientEmergencyContactsService.deleteContact(req.user.user_id, req.params.contactId);
      res.status(200).json({ success: true, data: contact });
    } catch (err) {
      next(err);
    }
  }
}

export default PatientEmergencyContactsController;
