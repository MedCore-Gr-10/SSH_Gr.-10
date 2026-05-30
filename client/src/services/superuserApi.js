import { apiFetch } from "./apiClient";

export const superuserFetch = (path, options = {}) => {
  const nextPath = path.startsWith("/") ? path : `/${path}`;
  return apiFetch(`/superuser${nextPath}`, options);
};
