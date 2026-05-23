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

export const searchPatientAppointments = async (filters) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const query = params.toString();
  const response = await fetch(`/api/patient/appointments/search${query ? `?${query}` : ""}`, {
    headers: getHeaders(),
  });

  return readResponse(response);
};

export const getPatientAppointmentFilters = async () => {
  const response = await fetch("/api/patient/appointments/filters", {
    headers: getHeaders(),
  });

  return readResponse(response);
};

export const bookPatientAppointment = async (slotId) => {
  const response = await fetch(`/api/patient/appointments/${slotId}/book`, {
    method: "POST",
    headers: getHeaders(),
  });

  return readResponse(response);
};
