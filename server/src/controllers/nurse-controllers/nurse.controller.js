import NurseService from "../../services/nurse-services/nurse.service.js";

class NurseController {
  async getDashboard(req, res, next) {
    try {
      const data = await NurseService.getDashboardStats(
        req.user.user_id,
        req.user.hospital_id,
      );
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getMySchedule(req, res, next) {
    try {
      const data = await NurseService.getMySchedule(
        req.user.user_id,
        req.user.hospital_id,
      );
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getStaffSchedules(req, res, next) {
    try {
      const data = await NurseService.getHospitalStaffSchedules(
        req.user.user_id,
        req.user.hospital_id,
      );
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getPatients(req, res, next) {
    try {
      const data = await NurseService.getMyPatients(
        req.user.user_id,
        req.user.hospital_id,
      );
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async searchPatients(req, res, next) {
    try {
      const data = await NurseService.searchPatients(
        req.user.user_id,
        req.user.hospital_id,
        req.query.q,
        req.query.reason,
      );
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getPatient(req, res, next) {
    try {
      const data = await NurseService.getPatientSummary(
        req.user.user_id,
        req.user.hospital_id,
        req.params.id,
        req.query.reason,
      );
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getPatientAllergies(req, res, next) {
    try {
      const data = await NurseService.getPatientAllergies(
        req.user.user_id,
        req.user.hospital_id,
        req.params.id,
        req.query.reason,
      );
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getPatientInsurance(req, res, next) {
    try {
      const data = await NurseService.getPatientInsurance(
        req.user.user_id,
        req.user.hospital_id,
        req.params.id,
        req.query.reason,
      );
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getPatientEmergencyContacts(req, res, next) {
    try {
      const data = await NurseService.getPatientEmergencyContacts(
        req.user.user_id,
        req.user.hospital_id,
        req.params.id,
        req.query.reason,
      );
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getPatientHistory(req, res, next) {
    try {
      const data = await NurseService.getPatientHistory(
        req.user.user_id,
        req.user.hospital_id,
        req.params.id,
        req.query.reason,
        {
          from: req.query.from,
          to: req.query.to,
          department_id: req.query.department_id,
        },
      );
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getPatientAppointments(req, res, next) {
    try {
      const data = await NurseService.getPatientAppointments(
        req.user.user_id,
        req.user.hospital_id,
        req.params.id,
        req.query.reason,
      );
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getAccessLogs(req, res, next) {
    try {
      const data = await NurseService.getAccessLogs(req.user.user_id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

export default new NurseController();
