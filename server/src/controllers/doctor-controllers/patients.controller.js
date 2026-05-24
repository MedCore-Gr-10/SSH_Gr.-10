import appointmentsMadeRepository from "../../repositories/appointments-made.repository.js";
import allergiesRepository from "../../repositories/allergies.repository.js";
import insuranceRepository from "../../repositories/insurance.repository.js";
import emergencyContactsRepository from "../../repositories/emergency-contacts.repository.js";
import profileRepository from "../../repositories/profile.repository.js";
import userRepository from "../../repositories/user.repository.js";
import logsRepository from "../../repositories/logs.repository.js";
import cacheService from "../../services/cache.service.js";

const DOCTOR_PATIENTS_CACHE_TTL_SECONDS = Number(
  process.env.DOCTOR_PATIENTS_CACHE_TTL_SECONDS || 60,
);

const MY_PATIENTS_ACTIONS = {
  ALLERGIES: "View allergies",
  INSURANCE: "View insurance",
  EMERGENCY_CONTACTS: "View emergency contacts",
  APPOINTMENTS: "View appointments",
  HISTORY: "View patient history",
};

class DoctorPatientsController {
  requireReason(reason, fieldLabel = "access") {
    const trimmed = (reason || "").trim();
    if (!trimmed || trimmed.length < 3) {
      throw new Error(
        `A reason (min. 3 characters) is required for ${fieldLabel}`,
      );
    }
    return trimmed;
  }

  async ensureDoctorPatient(doctorId, patientId) {
    const allowed = await appointmentsMadeRepository.hasDoctorPatient(
      doctorId,
      patientId,
    );

    if (!allowed) {
      throw new Error("Patient is not in your care");
    }
  }

  async resolvePatientProfileId(patientId) {
    const profileLink = await profileRepository.findUserProfile(patientId);
    if (!profileLink?.profiles?.id) {
      throw new Error("Patient profile not found");
    }
    return profileLink.profiles.id;
  }

  staffDisplayName(user) {
    if (!user) return null;
    const profile = user.users_profiles?.[0]?.profiles;
    const name = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();
    return name || user.username || null;
  }

  formatTimeValue(value) {
    if (!value) return null;
    if (typeof value === "string") {
      const match = value.match(/T(\d{2}:\d{2})/);
      if (match) return match[1];
      return value.length >= 5 ? value.slice(0, 5) : value;
    }
    return new Date(value).toISOString().slice(11, 16);
  }

  mapVisitRecord(appointment) {
    const slot = appointment.appointments_booking_slots;
    const template = slot?.appointments_templates;
    const staffDept = template?.staff_hospitals_departments;

    return {
      id: appointment.id,
      active: appointment.active_appointment_made ?? true,
      appointment_date: slot?.appointment_date || null,
      start_time: this.formatTimeValue(slot?.slot_start_time),
      end_time: this.formatTimeValue(slot?.slot_end_time),
      hospital_name:
        staffDept?.hospitals_departments?.hospitals?.hospital_name || null,
      department_name:
        staffDept?.hospitals_departments?.departments?.department_name || null,
      doctor_name:
        this.staffDisplayName(staffDept?.users) ||
        this.staffDisplayName(slot?.users),
      diagnoses: (appointment.diagnoses || []).map((d) => ({
        id: d.id,
        diagnosis: d.diagnosis,
        created_at: d.created_at,
      })),
      prescriptions: (appointment.prescriptions || []).map((p) => ({
        id: p.id,
        medication_name: p.medication_name,
        dosage: p.dosage,
        instructions: p.instructions,
        created_at: p.created_at,
      })),
    };
  }

  async logPatientAccess(doctorId, actionLabel, reason, patientId) {
    const patient = await userRepository.findById(patientId);
    const patientName =
      this.staffDisplayName(patient) || patient?.username || "Unknown patient";

    await logsRepository.create({
      user_id: doctorId,
      action: `${actionLabel} - ${patientName}`,
      reason,
    });
  }

  sortVisitsNewestFirst(visits) {
    return visits.sort((a, b) => {
      const dateA = a.appointment_date ? new Date(a.appointment_date).getTime() : 0;
      const dateB = b.appointment_date ? new Date(b.appointment_date).getTime() : 0;
      return dateB - dateA;
    });
  }

  async getPatients(req, res, next) {
    try {
      const doctorId = req.user.user_id;
      const cacheKey = cacheService.doctorPatientsKey(doctorId);
      const cachedPatients = await cacheService.getJson(cacheKey);

      if (cachedPatients) {
        return res.status(200).json({
          success: true,
          data: cachedPatients,
          cache: "HIT",
        });
      }

      const patients = await appointmentsMadeRepository.findDoctorPatients(doctorId);
      await cacheService.setJson(
        cacheKey,
        patients,
        DOCTOR_PATIENTS_CACHE_TTL_SECONDS,
      );

      res.status(200).json({ success: true, data: patients, cache: "MISS" });
    } catch (err) {
      next(err);
    }
  }

  async getPatientHistory(req, res, next) {
    try {
      const doctorId = req.user.user_id;
      const patientId = req.params.id;
      const accessReason = this.requireReason(req.query.reason, "history view");

      await this.ensureDoctorPatient(doctorId, patientId);

      const appointments =
        await appointmentsMadeRepository.findPatientHistoryForDoctor(
          patientId,
          doctorId,
          {
            dateFrom: req.query.from,
            dateTo: req.query.to,
          },
        );

      const visits = this.sortVisitsNewestFirst(
        appointments.map((appointment) => this.mapVisitRecord(appointment)),
      );
      const patient = await userRepository.findById(patientId);

      await this.logPatientAccess(
        doctorId,
        MY_PATIENTS_ACTIONS.HISTORY,
        accessReason,
        patientId,
      );

      res.status(200).json({
        success: true,
        data: {
          patient: {
            id: patientId,
            username: patient?.username,
            name: this.staffDisplayName(patient) || patient?.username,
            personal_no:
              patient?.users_profiles?.[0]?.profiles?.personal_no || null,
          },
          visits,
          total: visits.length,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getPatientAllergies(req, res, next) {
    try {
      const doctorId = req.user.user_id;
      const patientId = req.params.id;
      const accessReason = this.requireReason(req.query.reason, "allergies view");

      await this.ensureDoctorPatient(doctorId, patientId);

      const profileId = await this.resolvePatientProfileId(patientId);
      const allergies = await allergiesRepository.findByProfileId(profileId);

      await this.logPatientAccess(
        doctorId,
        MY_PATIENTS_ACTIONS.ALLERGIES,
        accessReason,
        patientId,
      );

      res.status(200).json({
        success: true,
        data: allergies || [],
      });
    } catch (err) {
      next(err);
    }
  }

  async getPatientInsurance(req, res, next) {
    try {
      const doctorId = req.user.user_id;
      const patientId = req.params.id;
      const accessReason = this.requireReason(req.query.reason, "insurance view");

      await this.ensureDoctorPatient(doctorId, patientId);

      const profileId = await this.resolvePatientProfileId(patientId);
      const insurance = await insuranceRepository.findProfileInsurance(profileId);

      await this.logPatientAccess(
        doctorId,
        MY_PATIENTS_ACTIONS.INSURANCE,
        accessReason,
        patientId,
      );

      res.status(200).json({
        success: true,
        data: insurance || [],
      });
    } catch (err) {
      next(err);
    }
  }

  async getPatientEmergencyContacts(req, res, next) {
    try {
      const doctorId = req.user.user_id;
      const patientId = req.params.id;
      const accessReason = this.requireReason(
        req.query.reason,
        "emergency contacts view",
      );

      await this.ensureDoctorPatient(doctorId, patientId);

      const profileId = await this.resolvePatientProfileId(patientId);
      const contacts = await emergencyContactsRepository.findProfileContacts(profileId);

      await this.logPatientAccess(
        doctorId,
        MY_PATIENTS_ACTIONS.EMERGENCY_CONTACTS,
        accessReason,
        patientId,
      );

      res.status(200).json({
        success: true,
        data: contacts || [],
      });
    } catch (err) {
      next(err);
    }
  }

  async getPatientAppointments(req, res, next) {
    try {
      const doctorId = req.user.user_id;
      const patientId = req.params.id;
      const accessReason = this.requireReason(req.query.reason, "appointments view");

      await this.ensureDoctorPatient(doctorId, patientId);

      const appointments =
        await appointmentsMadeRepository.findPatientAppointmentsForDoctor(
          patientId,
          doctorId,
        );
      const data = this.sortVisitsNewestFirst(
        appointments.map((appointment) => this.mapVisitRecord(appointment)),
      );

      await this.logPatientAccess(
        doctorId,
        MY_PATIENTS_ACTIONS.APPOINTMENTS,
        accessReason,
        patientId,
      );

      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default DoctorPatientsController;
