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
  if (!response.ok) throw new Error(payload.error || payload.message || `Request failed (${response.status})`);
  return payload.data ?? payload;
};

export const getTemplates = async () => {
  const res = await fetch(`${API}/director/appointments/templates`, { headers: getHeaders() });
  return handleResponse(res);
};

export const createTemplate = async (data) => {
  const res = await fetch(`${API}/director/appointments/templates`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updateTemplate = async (id, data) => {
  const res = await fetch(`${API}/director/appointments/templates/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deleteTemplate = async (id) => {
  const res = await fetch(`${API}/director/appointments/templates/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(res);
};
