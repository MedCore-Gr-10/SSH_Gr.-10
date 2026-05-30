import { apiRequest } from "./apiClient";

export const getDoctorDashboard = async () => {
  return apiRequest("/doctor/dashboard");
};
