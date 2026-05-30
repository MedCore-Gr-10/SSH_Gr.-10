import { apiRequest } from "./apiClient";

export const getPatientAllergies = () => apiRequest("/patient/allergies");

export const createPatientAllergy = (allergy) =>
  apiRequest("/patient/allergies", {
    method: "POST",
    body: allergy,
  });

export const deletePatientAllergy = (allergyId) =>
  apiRequest(`/patient/allergies/${allergyId}`, {
    method: "DELETE",
  });
