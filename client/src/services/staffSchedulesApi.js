import { apiRequest } from "./apiClient";

export const getStaffSchedules = async () => {
  return apiRequest("/staff/schedules");
};

export const getDoctorHospitalStaffSchedules = async () => {
  return apiRequest("/staff/schedules?scope=hospital");
};
