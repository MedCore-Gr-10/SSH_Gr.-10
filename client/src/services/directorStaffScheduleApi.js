import { apiRequest } from "./apiClient";

export const getDirectorStaffSchedules = async () => {
  return apiRequest("/director/staff-schedules");
};

export const createDirectorStaffSchedule = async (data) => {
  return apiRequest("/director/staff-schedules", {
    method: "POST",
    body: data,
  });
};

export const updateDirectorStaffSchedule = async (id, data) => {
  return apiRequest(`/director/staff-schedules/${id}`, {
    method: "PUT",
    body: data,
  });
};

export const deleteDirectorStaffSchedule = async (id) => {
  return apiRequest(`/director/staff-schedules/${id}`, {
    method: "DELETE",
  });
};
