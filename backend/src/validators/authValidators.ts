import { z } from 'zod';

const passwordSchema = z
  .string()
  // Master password strong hona chahiye, isliye ye rules lagaye gaye hain.
  .min(12, 'Password must be at least 12 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one symbol');

export const registerSchema = z.object({
  // Register ke liye name, email aur strong password chahiye.
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: passwordSchema
});

export const loginSchema = z.object({
  // Login me sirf email aur password required hain.
  email: z.string().trim().email(),
  password: z.string().min(1)
});

export const refreshSchema = z.object({
  // Refresh token optional cookie/body se aa sakta hai.
  refreshToken: z.string().min(1).optional()
});

export const forgotPasswordSchema = z.object({
  // Forgot password me bas email lagti hai.
  email: z.string().trim().email()
});

export const resetPasswordSchema = z.object({
  // Reset request me token aur new password dono required hain.
  email: z.string().trim().email(),
  resetToken: z.string().min(1),
  newPassword: passwordSchema
});

export const changePasswordSchema = z.object({
  // Change master password ke liye current aur new password chahiye.
  currentPassword: z.string().min(1),
  newPassword: passwordSchema
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
