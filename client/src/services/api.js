const API = import.meta.env.VITE_API_URL || "/api";

async function parseJsonResponse(res) {
  const text = await res.text();
  if (!text) {
    if (res.status === 404) {
      return {
        error:
          "API route not found. Restart the backend (npm start in server/) so forgot-password routes are loaded.",
      };
    }
    return {
      error: `Empty response from server (status ${res.status}). Is the backend running on port 3000?`,
    };
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    const preview = text.slice(0, 120).replace(/\s+/g, " ");
    return {
      error: `Invalid response from server (${res.status}). ${preview}${text.length > 120 ? "…" : ""}`,
    };
  }

  if (!res.ok) {
    return {
      error: data.error || data.message || `Request failed (${res.status})`,
    };
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

export const requestPasswordReset = async (email) => {
  const res = await apiFetch("/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res) {
    return {
      error:
        "Cannot reach the server. Start the backend: cd server && npm install && node src/index.js",
    };
  }
  return parseJsonResponse(res);
};

export const resetPassword = async (payload) => {
  const res = await apiFetch("/auth/reset-password", {
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
