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

export const getDoctorPatients = async () => {
  if (!localStorage.getItem("token")) {
    throw new Error("You are not signed in. Please sign in again as a doctor.");
  }

  const response = await fetch("http://127.0.0.1:3000/api/doctor/patients", {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};
