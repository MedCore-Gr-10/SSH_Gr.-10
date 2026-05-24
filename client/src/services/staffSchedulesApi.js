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

export const getStaffSchedules = async () => {
  const response = await fetch(`${API}/staff/schedules`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getDoctorHospitalStaffSchedules = async () => {
  const response = await fetch(`${API}/staff/schedules?scope=hospital`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};
