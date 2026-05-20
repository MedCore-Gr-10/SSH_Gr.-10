// Use relative /api in dev so Vite proxies to the backend (see vite.config.js).
// Set VITE_API_URL for production builds, e.g. http://localhost:3000/api
const API = import.meta.env.VITE_API_URL || "/api";

async function parseJsonResponse(res) {
  let data;
  try {
    data = await res.json();
  } catch {
    return { error: "Invalid response from server" };
  }
  if (!res.ok) {
    return { error: data.error || "Request failed" };
  }
  return data;
}

async function apiFetch(path, options) {
  try {
    return await fetch(`${API}${path}`, options);
  } catch {
    return null;
  }
}

export const loginUser = async (credentials) => {
  const res = await apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res) {
    return {
      error:
        "Cannot reach the server. Start the backend: cd server && npm install && node src/index.js",
    };
  }
  return parseJsonResponse(res);
};

export const registerUser = async (payload) => {
  const res = await apiFetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res) {
    return {
      error:
        "Cannot reach the server. Start the backend: cd server && npm install && node src/index.js",
    };
  }
  return parseJsonResponse(res);
};
