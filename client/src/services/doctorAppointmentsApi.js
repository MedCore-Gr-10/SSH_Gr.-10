const API = "http://localhost:3000/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

const handleResponse = async (response) => {
  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Server error (${response.status}): ${text}`);
  }
  if (!response.ok) {
    throw new Error(payload.error || payload.message || `Request failed (${response.status})`);
  }
  return payload.data ?? payload;
};

export const getDoctorTemplates = async () => {
  const res = await fetch(`${API}/doctor/appointments/templates`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const createDoctorTemplate = async (template, departmentId) => {
  const query = departmentId ? `?department_id=${encodeURIComponent(departmentId)}` : "";
  const res = await fetch(`${API}/doctor/appointments/templates${query}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(template),
  });
  return handleResponse(res);
};

export const deleteDoctorTemplate = async (templateId) => {
  const res = await fetch(`${API}/doctor/appointments/templates/${templateId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const getDoctorSlots = async (date) => {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  const res = await fetch(`${API}/doctor/appointments/slots${query}`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const getDoctorAvailableSlots = async (date) => {
  const res = await fetch(`${API}/doctor/appointments/slots/available?date=${encodeURIComponent(date)}`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const getDoctorSlotGenerationStatus = async () => {
  const res = await fetch(`${API}/doctor/appointments/slots/generation/status`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const generateDoctorWeeklySlots = async () => {
  const res = await fetch(`${API}/doctor/appointments/slots/generate/week`, {
    method: "POST",
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const generateDoctorSlotsRange = async (fromDate, toDate) => {
  const res = await fetch(`${API}/doctor/appointments/slots/generate/range`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ from_date: fromDate, to_date: toDate }),
  });
  return handleResponse(res);
};

export const generateDoctorTemplateSlots = async (templateId, fromDate, toDate) => {
  const res = await fetch(`${API}/doctor/appointments/slots/generate/template/${templateId}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ start_date: fromDate, end_date: toDate }),
  });
  return handleResponse(res);
};

export const deactivateDoctorSlot = async (slotId) => {
  const res = await fetch(`${API}/doctor/appointments/slots/${slotId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(res);
};
