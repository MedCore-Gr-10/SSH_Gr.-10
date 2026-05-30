import { apiRequest } from "./apiClient";

export const getDirectorSystemOverview = async () => {
  return apiRequest("/director/system-overview");
};
