export const todayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const validateBirthDate = (birth) => {
  if (!birth) return "Date of birth is required.";
  if (birth > todayDateString()) {
    return "Date of birth cannot be in the future.";
  }
  return null;
};

export const sanitizePhoneInput = (value) =>
  value.replace(/[^\d+\s-]/g, "");

export const validatePhoneNumber = (phone) => {
  if (!phone?.trim()) return "Phone number is required.";
  if (/[a-zA-Z]/.test(phone)) {
    return "Phone number cannot contain letters.";
  }

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) {
    return "Phone number must contain 8 to 15 digits.";
  }

  return null;
};

export const sanitizePersonalNoInput = (value) =>
  value.replace(/[^a-zA-Z0-9-]/g, "").toUpperCase();

export const validatePersonalNo = (personalNo) => {
  if (!personalNo?.trim()) return "Personal number is required.";

  const cleaned = personalNo.trim();
  if (cleaned.length < 6 || cleaned.length > 20) {
    return "Personal number must be 6 to 20 characters.";
  }
  if (!/^[A-Za-z0-9-]+$/.test(cleaned)) {
    return "Personal number can only contain letters, numbers, and hyphens.";
  }
  if (!/\d/.test(cleaned)) {
    return "Personal number must include at least one number.";
  }

  return null;
};

export const validateRegistrationProfile = ({ birth, personal_no, phone_number }) =>
  validateBirthDate(birth) ||
  validatePersonalNo(personal_no) ||
  validatePhoneNumber(phone_number) ||
  null;
