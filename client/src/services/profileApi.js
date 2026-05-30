import { apiRequest } from "./apiClient";

export const getMyProfile = async () => {
  return apiRequest("/profiles/me");
};

export const updateMyProfile = async (data) => {
  return apiRequest("/profiles/me", {
    method: "PUT",
    body: data,
  });
};
