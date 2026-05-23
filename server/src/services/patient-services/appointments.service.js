import appointmentsBookingSlotsRepository from "../../repositories/appointments-booking-slots.repository.js";
import patientHospitalsRepository from "../../repositories/patient-hospitals.repository.js";
import specializationsRepository from "../../repositories/specializations.repository.js";

class PatientAppointmentsService {
  formatHospital(hospital) {
    return {
      id: hospital.id,
      name: hospital.hospital_name || "",
      address: hospital.hospital_address || "",
      email: hospital.email || "",
    };
  }

  formatSpecialization(specialization) {
    return {
      id: specialization.id,
      name: specialization.specialization_name,
    };
  }

  formatTimeSlot(slot) {
    const start = this.formatTime(slot.slot_start_time);
    const end = this.formatTime(slot.slot_end_time);

    return {
      value: `${start}-${end}`,
      label: `${start}-${end}`,
    };
  }

  normalizeDate(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new Error("Invalid appointment date");
    }
    return date;
  }

  normalizeTime(value) {
    if (!value) return null;
    const startTime = String(value).split("-")[0]?.trim();
    if (!/^\d{1,2}:\d{2}(:\d{2})?$/.test(startTime)) {
      throw new Error("Invalid appointment time");
    }

    const [hour, minute, second = 0] = startTime.split(":").map(Number);
    return new Date(Date.UTC(1970, 0, 1, hour, minute, second)).toISOString();
  }

  formatDate(value) {
    if (!value) return "";
    return value.toISOString().slice(0, 10);
  }

  formatTime(value) {
    if (!value) return "";
    return value.toISOString().slice(11, 16);
  }

  getDoctorName(slot) {
    const profile = slot.users?.users_profiles?.[0]?.profiles;
    const fullName = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();
    return fullName ? `Dr. ${fullName}` : slot.users?.username || "Doctor";
  }

  getSpecialization(slot) {
    return (
      slot.appointments_templates?.staff_hospitals_departments?.staff_specializations?.[0]
        ?.specializations?.specialization_name ||
      slot.appointments_templates?.staff_hospitals_departments?.hospitals_departments?.departments
        ?.department_name ||
      "General Medicine"
    );
  }

  formatAppointment(slot) {
    const hospital =
      slot.appointments_templates?.staff_hospitals_departments?.hospitals_departments?.hospitals;
    const start = this.formatTime(slot.slot_start_time);
    const end = this.formatTime(slot.slot_end_time);

    return {
      id: slot.id,
      doctor: this.getDoctorName(slot),
      doctorId: slot.doctor_id,
      hospitalId: hospital?.id || slot.appointments_templates?.hospital_id,
      hospitalName: hospital?.hospital_name || "Hospital",
      specialization: this.getSpecialization(slot),
      time: `${start}-${end}`,
      date: this.formatDate(slot.appointment_date),
      location: hospital?.hospital_name || "Hospital",
      notes: "Available appointment slot.",
    };
  }

  async getAppointmentFilters() {
    const [hospitals, specializations, timeSlots] = await Promise.all([
      patientHospitalsRepository.findAllHospitals(),
      specializationsRepository.findAll(),
      appointmentsBookingSlotsRepository.findAvailablePatientTimeSlots(),
    ]);

    return {
      hospitals: hospitals.map((hospital) => this.formatHospital(hospital)),
      specializations: specializations.map((specialization) =>
        this.formatSpecialization(specialization)
      ),
      timeSlots: timeSlots.map((slot) => this.formatTimeSlot(slot)),
    };
  }

  async searchAppointments(patientId, query) {
    const requestedHospitalId = query.hospitalId ? Number(query.hospitalId) : null;
    if (query.hospitalId && !Number.isInteger(requestedHospitalId)) {
      throw new Error("Invalid hospital filter");
    }

    const slots = await appointmentsBookingSlotsRepository.searchAvailablePatientSlots({
      hospitalId: requestedHospitalId,
      doctorName: query.doctorName?.trim(),
      specialization: query.specialization?.trim(),
      date: this.normalizeDate(query.date),
      startTime: this.normalizeTime(query.time),
    });

    return slots.map((slot) => this.formatAppointment(slot));
  }
}

export default new PatientAppointmentsService();
