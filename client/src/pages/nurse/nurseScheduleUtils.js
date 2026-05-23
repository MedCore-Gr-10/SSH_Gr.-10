export const formatTime = (value) => {
  if (!value) return "—";
  if (typeof value === "string") {
    const match = value.match(/T(\d{2}:\d{2})/);
    if (match) return match[1];
    return value.length >= 5 ? value.slice(0, 5) : value;
  }
  return new Date(value).toISOString().slice(11, 16);
};

export const departmentName = (row) =>
  row.staff_hospitals_departments?.hospitals_departments?.departments
    ?.department_name || "—";

export const hospitalName = (row) =>
  row.staff_hospitals_departments?.hospitals_departments?.hospitals
    ?.hospital_name || "—";

export const staffUser = (row) => row.staff_hospitals_departments?.users;

export const staffProfile = (row) =>
  staffUser(row)?.users_profiles?.[0]?.profiles;

export const staffName = (row) => {
  const user = staffUser(row);
  const profile = staffProfile(row);
  const name = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();
  return name || user?.username || "—";
};

export const staffRole = (row) => {
  const roleName = staffUser(row)?.roles?.role_name;
  if (!roleName) return "—";
  return roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase();
};

export const matchesDaySearch = (row, query) => {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;
  return (row.day_of_week || "").toLowerCase().includes(trimmed);
};

export const matchesStaffNameSearch = (row, query) => {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;
  const fullName = staffName(row).toLowerCase();
  const username = (staffUser(row)?.username || "").toLowerCase();
  return fullName.includes(trimmed) || username.includes(trimmed);
};
