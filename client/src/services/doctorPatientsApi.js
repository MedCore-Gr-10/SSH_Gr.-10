import { apiRequest, getAuthToken } from "./apiClient";

const withReason = (reason) => {
  const params = new URLSearchParams();
  if (reason) params.set("reason", reason);
  return params.toString();
};

export const getDoctorPatients = async () => {
  if (!getAuthToken()) {
    throw new Error("You are not signed in. Please sign in again as a doctor.");
  }

  return apiRequest("/doctor/patients");
};

export const getDoctorPatientAllergies = async (id, reason) => {
  return apiRequest(`/doctor/patients/${id}/allergies?${withReason(reason)}`);
};

export const getDoctorPatientInsurance = async (id, reason) => {
  return apiRequest(`/doctor/patients/${id}/insurance?${withReason(reason)}`);
};

export const getDoctorPatientEmergencyContacts = async (id, reason) => {
  return apiRequest(
    `/doctor/patients/${id}/emergency-contacts?${withReason(reason)}`,
  );
};

export const getDoctorPatientHistory = async (id, reason, filters = {}) => {
  const params = new URLSearchParams();
  if (reason) params.set("reason", reason);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.department_id) params.set("department_id", filters.department_id);

  return apiRequest(`/doctor/patients/${id}/history?${params}`);
};

export const getDoctorPatientAppointments = async (id, reason) => {
  return apiRequest(`/doctor/patients/${id}/appointments?${withReason(reason)}`);
};
