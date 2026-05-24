const API = import.meta.env.VITE_API_URL || "/api";
const SUPERUSER_API = `${API}/superuser`;

export const superuserFetch = (path, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers || {});

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${SUPERUSER_API}${path}`, {
    ...options,
    headers,
  });
};
