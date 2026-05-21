export function passwordRulesMet(password) {
  return {
    length: password.length >= 8,
    numbers: /\d/.test(password),
    symbols: /[^A-Za-z0-9]/.test(password),
  };
}

export function allPasswordRulesMet(rules) {
  return rules.length && rules.numbers && rules.symbols;
}

export function validatePassword(password) {
  const rules = passwordRulesMet(password);
  if (!allPasswordRulesMet(rules)) {
    return "Password must be at least 8 characters and include a number and a symbol";
  }
  return null;
}
