export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

// Har character bucket ko alag rakha gaya hai taaki generator controlable rahe.
const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
const numberChars = '0123456789';
const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export function generatePassword(options: PasswordOptions): string {
  // User ke selected rules ke hisaab se allowed character pool banta hai.
  const pool = [
    options.uppercase ? uppercaseChars : '',
    options.lowercase ? lowercaseChars : '',
    options.numbers ? numberChars : '',
    options.symbols ? symbolChars : ''
  ].join('');

  if (!pool) {
    return '';
  }

  const selectedChars = pool.split('');
  const length = Math.max(8, Math.min(128, options.length));
  let password = '';

  // Random characters loop karke strong password build hota hai.
  for (let index = 0; index < length; index += 1) {
    password += selectedChars[Math.floor(Math.random() * selectedChars.length)];
  }

  return password;
}

export function getPasswordStrength(password: string) {
  // Approx entropy aur character variety se strength label decide hota hai.
  const entropy = Math.round(password.length * Math.log2(Math.max(1, new Set(password).size)));

  if (password.length >= 16 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
    return { label: 'Very Strong', entropy };
  }

  if (password.length >= 12 && (/[A-Z]/.test(password) || /[a-z]/.test(password)) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
    return { label: 'Strong', entropy };
  }

  if (password.length >= 10) {
    return { label: 'Medium', entropy };
  }

  return { label: 'Weak', entropy };
}
