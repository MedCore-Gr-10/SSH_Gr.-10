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

export const getDirectorPatients = async () => {
  const response = await fetch(`${API}/director/patients`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const createDirectorPatient = async (payload) => {
  const response = await fetch(`${API}/director/patients`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const updateDirectorPatient = async (id, payload) => {
  const response = await fetch(`${API}/director/patients/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const deleteDirectorPatient = async (id) => {
  const response = await fetch(`${API}/director/patients/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
};
