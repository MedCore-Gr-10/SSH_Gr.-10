import { apiRequest } from "./apiClient";

export const getDirectorPatients = async () => {
  return apiRequest("/director/patients");
};

export const createDirectorPatient = async (payload) => {
  return apiRequest("/director/patients", {
    method: "POST",
    body: payload,
  });
};

export const updateDirectorPatient = async (id, payload) => {
  return apiRequest(`/director/patients/${id}`, {
    method: "PUT",
    body: payload,
  });
};

export const deleteDirectorPatient = async (id) => {
  return apiRequest(`/director/patients/${id}`, {
    method: "DELETE",
  });
};
