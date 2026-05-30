import { apiRequest } from "./apiClient";

export const sendPatientAiMessage = async ({ message, history }) => {
  return apiRequest("/ai/chat", {
    method: "POST",
    body: { message, history },
  });
};
