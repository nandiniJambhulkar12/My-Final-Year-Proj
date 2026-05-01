export type PasswordRule = {
  id: string;
  test: (s: string) => boolean;
  message: string;
};

export const passwordRules: PasswordRule[] = [
  { id: 'length', test: (s) => s.length >= 8, message: 'Minimum 8 characters' },
  { id: 'upper', test: (s) => /[A-Z]/.test(s), message: 'At least 1 uppercase letter' },
  { id: 'lower', test: (s) => /[a-z]/.test(s), message: 'At least 1 lowercase letter' },
  { id: 'number', test: (s) => /[0-9]/.test(s), message: 'At least 1 number' },
  { id: 'special', test: (s) => /[^A-Za-z0-9]/.test(s), message: 'At least 1 special character' },
];

export const validatePassword = (s: string) => {
  const results = passwordRules.map((r) => ({ id: r.id, pass: r.test(s), message: r.message }));
  const valid = results.every((r) => r.pass);
  return { valid, results };
};

export const passwordStrengthLabel = (s: string) => {
  const passed = passwordRules.reduce((acc, r) => acc + (r.test(s) ? 1 : 0), 0);
  if (passed <= 2) return 'Weak';
  if (passed === 3 || passed === 4) return 'Medium';
  return 'Strong';
};
