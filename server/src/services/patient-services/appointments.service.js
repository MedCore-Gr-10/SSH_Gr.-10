import appointmentsBookingSlotsRepository from "../../repositories/appointments-booking-slots.repository.js";
import appointmentsMadeRepository from "../../repositories/appointments-made.repository.js";
import allergiesRepository from "../../repositories/allergies.repository.js";
import patientHospitalsRepository from "../../repositories/patient-hospitals.repository.js";
import profileRepository from "../../repositories/profile.repository.js";
import specializationsRepository from "../../repositories/specializations.repository.js";
import staffWorkingSchedulesRepository from "../../repositories/staff-working-schedules.repository.js";

class PatientAppointmentsService {
  badRequest(message) {
    const error = new Error(message);
    error.status = 400;
    return error;
  }

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

  formatBookedAppointment(appointment) {
    const slot = appointment.appointments_booking_slots;

    return {
      id: appointment.id,
      active: appointment.active_appointment_made !== false,
      complete: appointment.appointment_is_complete === true,
      appointmentBookingSlotId: appointment.appointment_booking_slot_id,
      appointment: slot ? this.formatAppointment(slot) : null,
    };
  }

  formatCreatedAt(value) {
    if (!value) return "";
    return value.toISOString();
  }

  formatAllergy(allergy) {
    return {
      id: allergy.id,
      name: allergy.allergy_name,
      type: allergy.allergy_type,
      reaction: allergy.reaction_symptoms,
      severity: allergy.severity,
    };
  }

  formatPatientRecord(appointment, patientAllergies = []) {
    const slot = appointment.appointments_booking_slots;
    const formattedAppointment = slot ? this.formatAppointment(slot) : {};
    const prescriptions = (appointment.prescriptions || []).map((prescription) => ({
      id: prescription.id,
      medicationName: prescription.medication_name,
      dosage: prescription.dosage || "",
      instructions: prescription.instructions || "",
      createdAt: this.formatCreatedAt(prescription.created_at),
    }));
    const diagnoses = (appointment.diagnoses || []).map((diagnosis) => ({
      id: diagnosis.id,
      diagnosis: diagnosis.diagnosis,
      createdAt: this.formatCreatedAt(diagnosis.created_at),
    }));
    const createdAt =
      prescriptions[0]?.createdAt ||
      diagnoses[0]?.createdAt ||
      "";

    return {
      id: appointment.id,
      appointmentBookingSlotId: appointment.appointment_booking_slot_id,
      doctorName: formattedAppointment.doctor || "Doctor",
      hospitalName: formattedAppointment.hospitalName || "Hospital",
      specialization: formattedAppointment.specialization || "General Medicine",
      date: formattedAppointment.date || "",
      timeSlot: formattedAppointment.time || "",
      prescriptions,
      diagnoses,
      allergies: patientAllergies,
      createdAt,
    };
  }

  async getBookedAppointments(patientId) {
    const appointments = await appointmentsMadeRepository.findActivePatientAppointments(patientId);
    return appointments.map((appointment) => this.formatBookedAppointment(appointment));
  }

  async getPatientRecords(patientId) {
    const [appointments, profileLink] = await Promise.all([
      appointmentsMadeRepository.findCompletedPatientRecords(patientId),
      profileRepository.findUserProfile(patientId),
    ]);

    const patientAllergies = profileLink?.profiles
      ? await allergiesRepository.findByProfileId(profileLink.profiles.id)
      : [];
    const formattedAllergies = patientAllergies.map((allergy) => this.formatAllergy(allergy));

    return appointments.map((appointment) =>
      this.formatPatientRecord(appointment, formattedAllergies)
    );
  }

  async getPatientStaffSchedules(patientId) {
    const patientHospitals = await patientHospitalsRepository.findPatientHospitals(patientId);
    const hospitalIds = patientHospitals.map((entry) => entry.hospital_id);

    if (!hospitalIds.length) {
      return [];
    }

    const scheduleGroups = await Promise.all(
      hospitalIds.map((hospitalId) =>
        staffWorkingSchedulesRepository.findActiveHospitalSchedules(hospitalId)
      )
    );

    return scheduleGroups.flat();
  }

  async getAppointmentFilters(patientId) {
    const patientHospitals = await patientHospitalsRepository.findPatientHospitals(patientId);
    const hospitalIds = patientHospitals.map((entry) => entry.hospital_id);

    if (!hospitalIds.length) {
      const specializations = await specializationsRepository.findAll();
      return {
        hospitals: [],
        specializations: specializations.map((specialization) =>
          this.formatSpecialization(specialization)
        ),
        timeSlots: [],
      };
    }

    const [specializations, timeSlots] = await Promise.all([
      specializationsRepository.findAll(),
      appointmentsBookingSlotsRepository.findAvailablePatientTimeSlotsForHospitals(hospitalIds),
    ]);

    return {
      hospitals: patientHospitals.map((entry) => this.formatHospital(entry.hospitals)),
      specializations: specializations.map((specialization) =>
        this.formatSpecialization(specialization)
      ),
      timeSlots: timeSlots.map((slot) => this.formatTimeSlot(slot)),
    };
  }

  async searchAppointments(patientId, query) {
    const patientHospitals = await patientHospitalsRepository.findPatientHospitals(patientId);
    const hospitalIds = patientHospitals.map((entry) => entry.hospital_id);
    if (!hospitalIds.length) {
      return [];
    }

    const requestedHospitalId = query.hospitalId ? Number(query.hospitalId) : null;
    if (query.hospitalId && !Number.isInteger(requestedHospitalId)) {
      throw new Error("Invalid hospital filter");
    }
    if (requestedHospitalId && !hospitalIds.includes(requestedHospitalId)) {
      return [];
    }

    const slots = await appointmentsBookingSlotsRepository.searchAvailablePatientSlots({
      hospitalId: requestedHospitalId,
      hospitalIds,
      doctorName: query.doctorName?.trim(),
      specialization: query.specialization?.trim(),
      date: this.normalizeDate(query.date),
      startTime: this.normalizeTime(query.time),
    });

    return slots.map((slot) => this.formatAppointment(slot));
  }

  async bookAppointment(patientId, slotId) {
    const appointmentSlotId = Number(slotId);
    if (!Number.isInteger(appointmentSlotId)) {
      throw this.badRequest("Invalid appointment slot");
    }

    const slot = await appointmentsBookingSlotsRepository.findById(appointmentSlotId);
    if (!slot) {
      throw this.badRequest("Appointment slot not found");
    }
    if (slot.active_appointment_booking_slot === false) {
      throw this.badRequest("Appointment slot is not available");
    }
    if (slot.appointments_made?.length) {
      throw this.badRequest("Appointment slot is already booked");
    }

    const patientHospitals = await patientHospitalsRepository.findPatientHospitals(patientId);
    const hospitalIds = patientHospitals.map((entry) => entry.hospital_id);
    const slotHospitalId = slot.appointments_templates?.hospital_id;
    if (!slotHospitalId || !hospitalIds.includes(slotHospitalId)) {
      throw this.badRequest("Select this hospital on your dashboard before booking an appointment");
    }

    try {
      const appointment = await appointmentsMadeRepository.bookSlot(patientId, appointmentSlotId);
      return this.formatBookedAppointment(appointment);
    } catch (err) {
      if (err.code === "P2002") {
        throw this.badRequest("Appointment slot is already booked");
      }
      throw err;
    }
  }

  async cancelAppointment(patientId, appointmentId) {
    const id = Number(appointmentId);
    if (!Number.isInteger(id)) {
      throw this.badRequest("Invalid appointment");
    }

    const appointment = await appointmentsMadeRepository.findPatientAppointmentById(id, patientId);
    if (!appointment) {
      throw this.badRequest("Appointment not found");
    }

    await appointmentsMadeRepository.delete(id);

    return { id };
  }
}

export default new PatientAppointmentsService();
