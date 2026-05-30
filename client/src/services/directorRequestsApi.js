import { apiRequest } from "./apiClient";

export const getDirectorRequests = async () => {
  return apiRequest("/requests");
};

export const getDirectorRequestRecipients = async ({ type = "staff", search = "" } = {}) => {
  const params = new URLSearchParams({ type });
  if (search) params.set("search", search);

  return apiRequest(`/requests/recipients?${params.toString()}`);
};

export const createDirectorRequest = async (data) => {
  return apiRequest("/requests", {
    method: "POST",
    body: data,
  });
};
