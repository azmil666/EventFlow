
export function getPasswordStrength(password) {
  let score = 0;

  if (!password) return { score: 0, label: "Too Short" };

  if (password.length >= 6) score++;
  if (password.match(/[A-Z]/)) score++;
  if (password.match(/[0-9]/)) score++;
  if (password.match(/[^A-Za-z0-9]/)) score++;

  if (score <= 1) return { score, label: "Weak" };
  if (score === 2 || score === 3) return { score, label: "Medium" };
  if (score >= 4) return { score, label: "Strong" };

  return { score, label: "Weak" };
}
