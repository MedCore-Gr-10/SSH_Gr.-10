import { apiRequest } from "./apiClient";

export const getPatientRecords = async () => {
  return apiRequest("/patient/records");
};
