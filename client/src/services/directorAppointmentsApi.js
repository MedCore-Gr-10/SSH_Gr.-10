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

export const getDirectorAppointments = async () => {
  const response = await fetch(`${API}/director/appointments`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getDirectorAppointmentSlots = async () => {
  const response = await fetch(`${API}/director/appointments/slots`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const updateDirectorAppointment = async (id, data) => {
  const response = await fetch(`${API}/director/appointments/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const cancelDirectorAppointment = async (id) => {
  const response = await fetch(`${API}/director/appointments/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
};
