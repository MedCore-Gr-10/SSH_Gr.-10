const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

const readResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || payload.message || `Request failed (${response.status})`);
  }

  return payload.data ?? payload;
};

export const getPatientHospitals = async () => {
  const response = await fetch("/api/patient/hospitals", {
    headers: getHeaders(),
  });

  return readResponse(response);
};

export const updatePatientHospitals = async (hospitalIds) => {
  const response = await fetch("/api/patient/hospitals", {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ hospitalIds }),
  });

  return readResponse(response);
};
