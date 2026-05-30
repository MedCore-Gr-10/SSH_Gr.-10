import { apiRequest } from "./apiClient";

export const getDoctorTemplates = async () => {
  return apiRequest("/doctor/appointments/templates");
};

export const getDoctorAssignments = async () => {
  return apiRequest("/doctor/appointments/assignments");
};

export const createDoctorTemplate = async (template, departmentId) => {
  const body = departmentId ? { ...template, department_id: Number(departmentId) } : template;
  return apiRequest("/doctor/appointments/templates", {
    method: "POST",
    body,
  });
};

export const deleteDoctorTemplate = async (templateId) => {
  return apiRequest(`/doctor/appointments/templates/${templateId}`, {
    method: "DELETE",
  });
};

export const getDoctorSlots = async (date) => {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return apiRequest(`/doctor/appointments/slots${query}`);
};

export const getDoctorAvailableSlots = async (date) => {
  return apiRequest(
    `/doctor/appointments/slots/available?date=${encodeURIComponent(date)}`,
  );
};

export const getDoctorSlotGenerationStatus = async () => {
  return apiRequest("/doctor/appointments/slots/generation/status");
};

export const generateDoctorWeeklySlots = async () => {
  return apiRequest("/doctor/appointments/slots/generate/week", {
    method: "POST",
  });
};

export const generateDoctorSlotsRange = async (fromDate, toDate) => {
  return apiRequest("/doctor/appointments/slots/generate/range", {
    method: "POST",
    body: { from_date: fromDate, to_date: toDate },
  });
};

export const generateDoctorTemplateSlots = async (templateId, fromDate, toDate) => {
  return apiRequest(`/doctor/appointments/slots/generate/template/${templateId}`, {
    method: "POST",
    body: { start_date: fromDate, end_date: toDate },
  });
};

export const deactivateDoctorSlot = async (slotId) => {
  return apiRequest(`/doctor/appointments/slots/${slotId}`, {
    method: "DELETE",
  });
};

export const markDoctorAppointmentComplete = async (appointmentId) => {
  return apiRequest(`/doctor/appointments/${appointmentId}/complete`, {
    method: "PATCH",
  });
};

export const saveDoctorAppointmentRecord = async (appointmentId, record) => {
  return apiRequest(`/doctor/appointments/${appointmentId}/record`, {
    method: "POST",
    body: record,
  });
};
