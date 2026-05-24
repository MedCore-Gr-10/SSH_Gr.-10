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

export const getPatientEmergencyContacts = async () => {
  const response = await fetch("/api/patient/emergency-contacts", {
    headers: getHeaders(),
  });

  return readResponse(response);
};

export const createPatientEmergencyContact = async (contact) => {
  const response = await fetch("/api/patient/emergency-contacts", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(contact),
  });

  return readResponse(response);
};

export const setPatientCurrentEmergencyContact = async (contactId) => {
  const response = await fetch(`/api/patient/emergency-contacts/${contactId}/current`, {
    method: "PATCH",
    headers: getHeaders(),
  });

  return readResponse(response);
};

export const deletePatientEmergencyContact = async (contactId) => {
  const response = await fetch(`/api/patient/emergency-contacts/${contactId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  return readResponse(response);
};
