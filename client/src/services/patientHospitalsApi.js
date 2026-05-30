import { apiRequest } from "./apiClient";

export const getPatientHospitals = async () => {
  return apiRequest("/patient/hospitals");
};

export const updatePatientHospitals = async (hospitalIds) => {
  return apiRequest("/patient/hospitals", {
    method: "PUT",
    body: { hospitalIds },
  });
};
