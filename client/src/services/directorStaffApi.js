import { apiRequest } from "./apiClient";

export const getDirectorStaff = async () => {
  return apiRequest("/director/staff");
};

export const getSpecializations = async () => {
  return apiRequest("/director/specializations");
};

export const createDirectorStaff = async (data) => {
  return apiRequest("/director/staff", {
    method: "POST",
    body: data,
  });
};

export const updateDirectorStaff = async (id, data) => {
  return apiRequest(`/director/staff/${id}`, {
    method: "PUT",
    body: data,
  });
};

export const deleteDirectorStaff = async (id) => {
  return apiRequest(`/director/staff/${id}`, {
    method: "DELETE",
  });
};
