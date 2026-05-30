import { apiRequest } from "./apiClient";

export const getPatientEmergencyContacts = async () => {
  return apiRequest("/patient/emergency-contacts");
};

export const createPatientEmergencyContact = async (contact) => {
  return apiRequest("/patient/emergency-contacts", {
    method: "POST",
    body: contact,
  });
};

export const setPatientCurrentEmergencyContact = async (contactId) => {
  return apiRequest(`/patient/emergency-contacts/${contactId}/current`, {
    method: "PATCH",
  });
};

export const deletePatientEmergencyContact = async (contactId) => {
  return apiRequest(`/patient/emergency-contacts/${contactId}`, {
    method: "DELETE",
  });
};
