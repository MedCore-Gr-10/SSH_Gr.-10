import { apiRequest } from "./apiClient";

export const searchPatientAppointments = async (filters) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return apiRequest(`/patient/appointments/search${query ? `?${query}` : ""}`);
};

export const getPatientAppointmentFilters = async () => {
  return apiRequest("/patient/appointments/filters");
};

export const bookPatientAppointment = async (slotId) => {
  return apiRequest(`/patient/appointments/${slotId}/book`, {
    method: "POST",
  });
};

export const getPatientBookedAppointments = async () => {
  return apiRequest("/patient/appointments/booked");
};

export const cancelPatientAppointment = async (appointmentId) => {
  return apiRequest(`/patient/appointments/${appointmentId}`, {
    method: "DELETE",
  });
};

export const getPatientStaffSchedules = async () => {
  return apiRequest("/patient/appointments/staff-schedules");
};
