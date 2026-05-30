import { apiRequest } from "./apiClient";

export const getDirectorAppointments = async () => {
  return apiRequest("/director/appointments");
};

export const getDirectorAppointmentSlots = async () => {
  return apiRequest("/director/appointments/slots");
};

export const updateDirectorAppointment = async (id, data) => {
  return apiRequest(`/director/appointments/${id}`, {
    method: "PUT",
    body: data,
  });
};

export const cancelDirectorAppointment = async (id) => {
  return apiRequest(`/director/appointments/${id}`, {
    method: "DELETE",
  });
};
