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

export const getDirectorRequests = async () => {
  const response = await fetch(`${API}/requests`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getDirectorRequestRecipients = async ({ type = "staff", search = "" } = {}) => {
  const params = new URLSearchParams({ type });
  if (search) params.set("search", search);

  const response = await fetch(`${API}/requests/recipients?${params.toString()}`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const createDirectorRequest = async (data) => {
  const response = await fetch(`${API}/requests`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};
