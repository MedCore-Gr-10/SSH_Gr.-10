const API = "http://127.0.0.1:3000/api/doctor";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

const parseResponse = async (response) => {
  const text = await response.text();
  let payload;

  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Server error (${response.status}): ${text}`);
  }

  return payload;
};

const handleResponse = async (response) => {
  const payload = await parseResponse(response);

  if (!response.ok) {
    const message = payload.error || payload.message || `Request failed (${response.status})`;
    throw new Error(`${message} [${response.url}]`);
  }

  return payload.data ?? payload;
};

const withReason = (reason) => {
  const params = new URLSearchParams();
  if (reason) params.set("reason", reason);
  return params.toString();
};

export const getDoctorPatients = async () => {
  if (!localStorage.getItem("token")) {
    throw new Error("You are not signed in. Please sign in again as a doctor.");
  }

  const response = await fetch(`${API}/patients`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getDoctorPatientAllergies = async (id, reason) => {
  const response = await fetch(
    `${API}/patients/${id}/allergies?${withReason(reason)}`,
    { method: "GET", headers: getHeaders() },
  );
  return handleResponse(response);
};

export const getDoctorPatientInsurance = async (id, reason) => {
  const response = await fetch(
    `${API}/patients/${id}/insurance?${withReason(reason)}`,
    { method: "GET", headers: getHeaders() },
  );
  return handleResponse(response);
};

export const getDoctorPatientEmergencyContacts = async (id, reason) => {
  const response = await fetch(
    `${API}/patients/${id}/emergency-contacts?${withReason(reason)}`,
    { method: "GET", headers: getHeaders() },
  );
  return handleResponse(response);
};

export const getDoctorPatientHistory = async (id, reason, filters = {}) => {
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

export const getDoctorPatientAppointments = async (id, reason) => {
  const response = await fetch(
    `${API}/patients/${id}/appointments?${withReason(reason)}`,
    { method: "GET", headers: getHeaders() },
  );
  return handleResponse(response);
};
