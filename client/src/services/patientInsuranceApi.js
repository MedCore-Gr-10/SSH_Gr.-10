import { apiRequest } from "./apiClient";

export const getPatientInsurance = () => apiRequest("/patient/insurance");

export const upsertPatientInsurance = (insurance) =>
  apiRequest("/patient/insurance", {
    method: "POST",
    body: insurance,
  });

export const deletePatientInsurance = (insuranceId) =>
  apiRequest(`/patient/insurance/${insuranceId}`, {
    method: "DELETE",
  });
