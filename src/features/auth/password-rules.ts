/** Strength-meter rules. Only "8+ characters" is enforced by the server. */
export function passwordChecks(password: string) {
  return {
    length: password.length >= 8,
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}
