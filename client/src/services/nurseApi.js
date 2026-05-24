const API = "http://localhost:3000/api/nurse";

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
    throw new Error(
      payload.error || payload.message || `Request failed (${response.status})`,
    );
  }

  return payload.data ?? payload;
};

const withReason = (reason) => {
  const params = new URLSearchParams();
  if (reason) params.set("reason", reason);
  return params.toString();
};

export const getNurseDashboard = async () => {
  const response = await fetch(`${API}/dashboard`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getNurseMySchedule = async () => {
  const response = await fetch(`${API}/schedules/me`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getNurseStaffSchedules = async () => {
  const response = await fetch(`${API}/schedules/staff`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getNursePatients = async () => {
  const response = await fetch(`${API}/patients`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const searchNursePatients = async (q, reason) => {
  const params = new URLSearchParams({ q, reason });
  const response = await fetch(`${API}/patients/search?${params}`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getNursePatient = async (id, reason) => {
  const response = await fetch(
    `${API}/patients/${id}?${withReason(reason)}`,
    { method: "GET", headers: getHeaders() },
  );
  return handleResponse(response);
};

export const getNursePatientAllergies = async (id, reason) => {
  const response = await fetch(
    `${API}/patients/${id}/allergies?${withReason(reason)}`,
    { method: "GET", headers: getHeaders() },
  );
  return handleResponse(response);
};

export const getNursePatientInsurance = async (id, reason) => {
  const response = await fetch(
    `${API}/patients/${id}/insurance?${withReason(reason)}`,
    { method: "GET", headers: getHeaders() },
  );
  return handleResponse(response);
};

export const getNursePatientEmergencyContacts = async (id, reason) => {
  const response = await fetch(
    `${API}/patients/${id}/emergency-contacts?${withReason(reason)}`,
    { method: "GET", headers: getHeaders() },
  );
  return handleResponse(response);
};

export const getNursePatientHistory = async (id, reason, filters = {}) => {
  const params = new URLSearchParams();
  if (reason) params.set("reason", reason);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.department_id) params.set("department_id", filters.department_id);

  const response = await fetch(
    `${API}/patients/${id}/history?${params}`,
    { method: "GET", headers: getHeaders() },
  );
  return handleResponse(response);
};

export const getNursePatientAppointments = async (id, reason) => {
  const response = await fetch(
    `${API}/patients/${id}/appointments?${withReason(reason)}`,
    { method: "GET", headers: getHeaders() },
  );
  return handleResponse(response);
};

export const getNurseAccessLogs = async () => {
  const response = await fetch(`${API}/logs`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};
