import { apiRequest } from "./apiClient";

const withReason = (reason) => {
  const params = new URLSearchParams();
  if (reason) params.set("reason", reason);
  return params.toString();
};

export const getNurseDashboard = async () => {
  return apiRequest("/nurse/dashboard");
};

export const getNurseMySchedule = async () => {
  return apiRequest("/nurse/schedules/me");
};

export const getNurseStaffSchedules = async () => {
  return apiRequest("/nurse/schedules/staff");
};

export const getNursePatients = async () => {
  return apiRequest("/nurse/patients");
};

export const searchNursePatients = async (q, reason) => {
  const params = new URLSearchParams({ q, reason });
  return apiRequest(`/nurse/patients/search?${params}`);
};

export const getNursePatient = async (id, reason) => {
  return apiRequest(`/nurse/patients/${id}?${withReason(reason)}`);
};

export const getNursePatientAllergies = async (id, reason) => {
  return apiRequest(`/nurse/patients/${id}/allergies?${withReason(reason)}`);
};

export const getNursePatientInsurance = async (id, reason) => {
  return apiRequest(`/nurse/patients/${id}/insurance?${withReason(reason)}`);
};

export const getNursePatientEmergencyContacts = async (id, reason) => {
  return apiRequest(
    `/nurse/patients/${id}/emergency-contacts?${withReason(reason)}`,
  );
};

export const getNursePatientHistory = async (id, reason, filters = {}) => {
  const params = new URLSearchParams();
  if (reason) params.set("reason", reason);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.department_id) params.set("department_id", filters.department_id);

  return apiRequest(`/nurse/patients/${id}/history?${params}`);
};

export const getNursePatientAppointments = async (id, reason) => {
  return apiRequest(`/nurse/patients/${id}/appointments?${withReason(reason)}`);
};

export const getNurseAccessLogs = async () => {
  return apiRequest("/nurse/logs");
};
