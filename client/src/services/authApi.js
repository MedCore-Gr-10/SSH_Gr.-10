import { apiRequest } from "./apiClient";

const networkError = {
  error:
    "Cannot reach the server. Start the backend: cd server && npm install && node src/index.js",
};

const authRequest = async (path, payload) => {
  try {
    return await apiRequest(path, {
      method: "POST",
      auth: false,
      body: payload,
    });
  } catch (error) {
    return { error: error.message || networkError.error };
  }
};

export const loginUser = (credentials) => authRequest("/auth/login", credentials);

export const registerUser = (payload) => authRequest("/auth/register", payload);
