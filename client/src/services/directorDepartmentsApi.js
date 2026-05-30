import { apiRequest } from "./apiClient";

export const getDirectorDepartments = async () => {
  return apiRequest("/director/departments");
};

export const getDirectorDepartmentCatalog = async () => {
  return apiRequest("/director/departments/catalog");
};

export const activateDirectorDepartment = async (departmentId) => {
  return apiRequest("/director/departments", {
    method: "POST",
    body: { department_id: departmentId },
  });
};

export const updateDirectorDepartment = async (id, data) => {
  return apiRequest(`/director/departments/${id}`, {
    method: "PUT",
    body: data,
  });
};

export const deleteDirectorDepartment = async (id) => {
  return apiRequest(`/director/departments/${id}`, {
    method: "DELETE",
  });
};
