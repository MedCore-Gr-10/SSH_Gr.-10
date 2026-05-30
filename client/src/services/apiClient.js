export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const getAuthToken = () => localStorage.getItem("token");

export const createAuthHeaders = (headers = {}) => {
  const nextHeaders = new Headers(headers);
  const token = getAuthToken();

  if (token) {
    nextHeaders.set("Authorization", `Bearer ${token}`);
  }

  return nextHeaders;
};

const buildApiUrl = (path) => {
  if (/^https?:\/\//i.test(path)) return path;

  const base = API_BASE_URL.replace(/\/$/, "");
  const nextPath = path.startsWith("/") ? path : `/${path}`;

  return `${base}${nextPath}`;
};

const normalizeBody = (body, headers) => {
  if (!body || typeof body === "string" || body instanceof FormData) {
    return body;
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return JSON.stringify(body);
};

export const parseApiResponse = async (response) => {
  const text = await response.text();
  let payload = {};

  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Server error (${response.status}): ${text}`);
  }

  if (!response.ok) {
    throw new Error(
      payload.error || payload.message || `Request failed (${response.status})`,
    );
  }

  return payload.data ?? payload;
};

export const apiFetch = (path, options = {}) => {
  const { auth = true, headers, body, ...fetchOptions } = options;
  const requestHeaders = auth
    ? createAuthHeaders(headers)
    : new Headers(headers || {});

  const requestBody = normalizeBody(body, requestHeaders);

  return fetch(buildApiUrl(path), {
    ...fetchOptions,
    headers: requestHeaders,
    body: requestBody,
  });
};

export const apiRequest = async (path, options = {}) => {
  const response = await apiFetch(path, options);
  return parseApiResponse(response);
};
