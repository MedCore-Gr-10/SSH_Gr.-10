import AppointmentsMadeRepository from "../../repositories/appointments-made.repository.js";

class AppointmentsMadeService {
  async getAllAppointments() {
    const data = await AppointmentsMadeRepository.getAllBookedAppointments();

    // Helper function to extract names from the nested Prisma structure
    const getFullName = (userObj) => {
      const profile = userObj?.users_profiles?.[0]?.profiles;
      if (!profile) return "N/A";
      return `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
    };

    return data.map((appt) => {
      const slot = appt.appointments_booking_slots;

      return {
        id: appt.id,
        patient: getFullName(appt.users),
        doctor: getFullName(slot?.users),
        hospital: slot?.appointments_templates?.staff_hospitals_departments?.hospitals_departments?.hospitals?.hospital_name || "N/A",
        date: slot?.appointment_date,
        time: slot?.slot_start_time,
        endTime: slot?.slot_end_time,
        appointment_is_complete: appt.appointment_is_complete === true,
      };
    });
  }
}

export default new AppointmentsMadeService();
