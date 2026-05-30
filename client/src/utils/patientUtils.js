const normalize = (value) => String(value || "").toLowerCase();

export const patientProfile = (patient) =>
  patient.users_profiles?.[0]?.profiles || {};

export const patientFullName = (patient) => {
  const profile = patientProfile(patient);
  return `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
};

export const patientPersonalNo = (patient) =>
  patientProfile(patient).personal_no || "";

export const patientLabel = (patient) => {
  const name = patientFullName(patient);
  return name || patient.username || patient.id;
};

export const matchesPatientSearch = (patient, query) => {
  const trimmed = query.trim();
  if (!trimmed) return true;

  const normalizedQuery = normalize(trimmed);
  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  const fullName = normalize(patientFullName(patient));
  const personalNo = normalize(patientPersonalNo(patient));

  if (personalNo && personalNo.includes(normalizedQuery)) {
    return true;
  }

  if (!fullName) return false;

  return terms.every((term) => fullName.includes(term));
};
