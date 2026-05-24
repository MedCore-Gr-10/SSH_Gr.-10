import prisma from "../../prisma.js";
import userRepository from "../../repositories/user.repository.js";
import staffScheduleRepository from "../../repositories/staff-working-schedules.repository.js";
import profileRepository from "../../repositories/profile.repository.js";
import allergiesRepository from "../../repositories/allergies.repository.js";
import insuranceRepository from "../../repositories/insurance.repository.js";
import emergencyContactsRepository from "../../repositories/emergency-contacts.repository.js";
import appointmentsMadeRepository from "../../repositories/appointments-made.repository.js";
import logsRepository from "../../repositories/logs.repository.js";
import systemOverviewRepository from "../../repositories/system-overview.repository.js";

const WEEK_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Log labels shown in Access Logs (My Patients page only). */
const MY_PATIENTS_ACTIONS = {
  SEARCH: "Search patients",
  ALLERGIES: "View allergies",
  INSURANCE: "View insurance",
  EMERGENCY_CONTACTS: "View emergency contacts",
  APPOINTMENTS: "View appointments",
  HISTORY: "View patient history",
};

class NurseService {
  async ensureNurseAtHospital(nurseId, hospitalId) {
    const nurse = await userRepository.findById(nurseId);
    if (!nurse) {
      throw new Error("Nurse not found");
    }

    const assignment = nurse.staff_hospitals_departments?.find(
      (entry) => entry.hospital_id === hospitalId,
    );
    if (!assignment) {
      throw new Error("Nurse is not authorized for this hospital");
    }

    return nurse;
  }

  async resolvePatientProfileId(patientId) {
    const profileLink = await profileRepository.findUserProfile(patientId);
    if (!profileLink?.profiles?.id) {
      throw new Error("Patient profile not found");
    }
    return profileLink.profiles.id;
  }

  async ensurePatientInHospital(patientId, hospitalId) {
    const link = await prisma.patients_hospitals.findUnique({
      where: {
        patient_id_hospital_id: {
          patient_id: patientId,
          hospital_id: hospitalId,
        },
      },
    });

    if (!link) {
      throw new Error("Patient is not in your hospital tenant");
    }
  }

  requireReason(reason, fieldLabel = "access") {
    const trimmed = (reason || "").trim();
    if (!trimmed || trimmed.length < 3) {
      throw new Error(
        `A reason (min. 3 characters) is required for ${fieldLabel}`,
      );
    }
    return trimmed;
  }

  async logMyPatientsAccess(userId, actionLabel, reason, patientId = null) {
    let action = actionLabel;
    if (patientId) {
      const patient = await userRepository.findById(patientId);
      const patientName =
        this.staffDisplayName(patient) || patient?.username || "Unknown patient";
      action = `${actionLabel} — ${patientName}`;
    }
    await logsRepository.create({
      user_id: userId,
      action,
      reason,
    });
  }

  async getDashboardStats(nurseId, hospitalId) {
    await this.ensureNurseAtHospital(nurseId, hospitalId);

    const patients = await userRepository.findHospitalTenantPatients(hospitalId);
    const schedules = await staffScheduleRepository.findActiveStaffSchedule(
      nurseId,
      hospitalId,
    );

    const todayName = WEEK_DAYS[new Date().getDay()];
    const shiftsToday = schedules.filter(
      (slot) => slot.day_of_week === todayName,
    ).length;

    const staffCount =
      await systemOverviewRepository.countStaff(hospitalId);

    return {
      activePatients: patients.length,
      shiftsToday,
      staffCount,
    };
  }

  async getMySchedule(nurseId, hospitalId) {
    await this.ensureNurseAtHospital(nurseId, hospitalId);

    const schedules = await staffScheduleRepository.findActiveStaffSchedule(
      nurseId,
      hospitalId,
    );

    return schedules;
  }

  async getHospitalStaffSchedules(nurseId, hospitalId) {
    await this.ensureNurseAtHospital(nurseId, hospitalId);

    return staffScheduleRepository.findActiveHospitalSchedules(hospitalId);
  }

  async getMyPatients(nurseId, hospitalId) {
    await this.ensureNurseAtHospital(nurseId, hospitalId);

    return userRepository.findHospitalTenantPatients(hospitalId);
  }

  async searchPatients(nurseId, hospitalId, query, reason) {
    await this.ensureNurseAtHospital(nurseId, hospitalId);
    const accessReason = this.requireReason(reason, "patient search");

    const patients = await userRepository.searchHospitalTenantPatients(
      hospitalId,
      query,
    );

    await this.logMyPatientsAccess(
      nurseId,
      MY_PATIENTS_ACTIONS.SEARCH,
      `Search: "${query}". ${accessReason}`,
    );

    return patients;
  }

  async getPatientSummary(nurseId, hospitalId, patientId, reason) {
    await this.ensureNurseAtHospital(nurseId, hospitalId);
    await this.ensurePatientInHospital(patientId, hospitalId);
    this.requireReason(reason, "patient profile view");

    const patient = await userRepository.findById(patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }

    return patient;
  }

  async getPatientAllergies(nurseId, hospitalId, patientId, reason) {
    await this.ensureNurseAtHospital(nurseId, hospitalId);
    await this.ensurePatientInHospital(patientId, hospitalId);
    const accessReason = this.requireReason(reason, "allergies view");

    const profileId = await this.resolvePatientProfileId(patientId);
    const allergies = await allergiesRepository.findByProfileId(profileId);

    await this.logMyPatientsAccess(
      nurseId,
      MY_PATIENTS_ACTIONS.ALLERGIES,
      accessReason,
      patientId,
    );

    return allergies;
  }

  async getPatientInsurance(nurseId, hospitalId, patientId, reason) {
    await this.ensureNurseAtHospital(nurseId, hospitalId);
    await this.ensurePatientInHospital(patientId, hospitalId);
    const accessReason = this.requireReason(reason, "insurance view");

    const profileId = await this.resolvePatientProfileId(patientId);
    const insurance = await insuranceRepository.findProfileInsurance(profileId);

    await this.logMyPatientsAccess(
      nurseId,
      MY_PATIENTS_ACTIONS.INSURANCE,
      accessReason,
      patientId,
    );

    return insurance;
  }

  async getPatientEmergencyContacts(nurseId, hospitalId, patientId, reason) {
    await this.ensureNurseAtHospital(nurseId, hospitalId);
    await this.ensurePatientInHospital(patientId, hospitalId);
    const accessReason = this.requireReason(reason, "emergency contacts view");

    const profileId = await this.resolvePatientProfileId(patientId);
    const contacts =
      await emergencyContactsRepository.findProfileContacts(profileId);

    await this.logMyPatientsAccess(
      nurseId,
      MY_PATIENTS_ACTIONS.EMERGENCY_CONTACTS,
      accessReason,
      patientId,
    );

    return contacts;
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

  staffDisplayName(user) {
    if (!user) return null;
    const profile = user.users_profiles?.[0]?.profiles;
    const name = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();
    return name || user.username || null;
  }

  mapVisitRecord(appointment, fallbackHospitalName) {
    const slot = appointment.appointments_booking_slots;
    const template = slot?.appointments_templates;
    const staffDept = template?.staff_hospitals_departments;
    const hospital =
      staffDept?.hospitals_departments?.hospitals?.hospital_name ||
      fallbackHospitalName;

    return {
      id: appointment.id,
      active: appointment.active_appointment_made ?? true,
      complete: appointment.appointment_is_complete === true,
      appointment_date: slot?.appointment_date || null,
      start_time: this.formatTimeValue(slot?.slot_start_time),
      end_time: this.formatTimeValue(slot?.slot_end_time),
      hospital_name: hospital,
      department_name:
        staffDept?.hospitals_departments?.departments?.department_name || null,
      doctor_name: this.staffDisplayName(staffDept?.users),
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

  async getPatientHistory(nurseId, hospitalId, patientId, reason, filters = {}) {
    await this.ensureNurseAtHospital(nurseId, hospitalId);
    await this.ensurePatientInHospital(patientId, hospitalId);
    const accessReason = this.requireReason(reason, "history view");

    const hospital = await prisma.hospitals.findUnique({
      where: { id: hospitalId },
      select: { hospital_name: true },
    });

    const appointments =
      await appointmentsMadeRepository.findPatientHistoryAtHospital(
        patientId,
        hospitalId,
        {
          dateFrom: filters.from,
          dateTo: filters.to,
          departmentId: filters.department_id,
        },
      );

    const visits = appointments
      .map((a) =>
        this.mapVisitRecord(a, hospital?.hospital_name || null),
      )
      .sort((a, b) => {
        const dateA = a.appointment_date
          ? new Date(a.appointment_date).getTime()
          : 0;
        const dateB = b.appointment_date
          ? new Date(b.appointment_date).getTime()
          : 0;
        return dateB - dateA;
      });

    await this.logMyPatientsAccess(
      nurseId,
      MY_PATIENTS_ACTIONS.HISTORY,
      accessReason,
      patientId,
    );

    const patient = await userRepository.findById(patientId);

    return {
      patient: {
        id: patientId,
        username: patient?.username,
        name: this.staffDisplayName(patient) || patient?.username,
        personal_no:
          patient?.users_profiles?.[0]?.profiles?.personal_no || null,
      },
      visits,
      total: visits.length,
    };
  }

  async getPatientAppointments(nurseId, hospitalId, patientId, reason) {
    await this.ensureNurseAtHospital(nurseId, hospitalId);
    await this.ensurePatientInHospital(patientId, hospitalId);
    const accessReason = this.requireReason(reason, "appointments view");

    const appointments =
      await appointmentsMadeRepository.findPatientAppointmentsAtHospital(
        patientId,
        hospitalId,
      );

    await this.logMyPatientsAccess(
      nurseId,
      MY_PATIENTS_ACTIONS.APPOINTMENTS,
      accessReason,
      patientId,
    );

    return appointments;
  }

  async getAccessLogs(nurseId) {
    return logsRepository.findMyPatientsLogs(nurseId, 200);
  }
}

export default new NurseService();
