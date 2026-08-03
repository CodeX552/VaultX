import { type Request, type Response } from 'express';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { changePasswordSchema, forgotPasswordSchema, loginSchema, refreshSchema, registerSchema, resetPasswordSchema } from '../validators/authValidators';
import { changePassword, forgotPassword, loginUser, logoutUser, refreshAuthToken, registerUser, resetPassword } from '../services/authService';

// Ye options refresh token cookie ko secure aur http-only banate hain.
const refreshCookieOptions = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: env.NODE_ENV === 'production',
  path: '/api'
};

// Login/register ke baad refresh token cookie set karke common response bhejta hai.
function respondWithAuth(response: Response, user: unknown, accessToken: string, refreshToken: string): void {
  response.cookie('refreshToken', refreshToken, {
    ...refreshCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  response.status(200).json({
    success: true,
    user,
    accessToken
  });
}

export async function register(request: Request, response: Response): Promise<void> {
  // Body ko schema se validate kiya ja raha hai.
  const parsed = registerSchema.safeParse(request.body);

  if (!parsed.success) {
    throw new AppError('Validation failed', 400);
  }

  const telemetry = {
    ip: request.ip || request.socket.remoteAddress || '127.0.0.1',
    userAgent: request.headers['user-agent'] || 'Unknown'
  };

  const result = await registerUser(parsed.data, telemetry);
  return respondWithAuth(response, result.user, result.tokens.accessToken, result.tokens.refreshToken);
}

export async function login(request: Request, response: Response) {
  // Login request ke input ko verify kar rahe hain.
  const parsed = loginSchema.safeParse(request.body);

  if (!parsed.success) {
    throw new AppError('Validation failed', 400);
  }

  const telemetry = {
    ip: request.ip || request.socket.remoteAddress || '127.0.0.1',
    userAgent: request.headers['user-agent'] || 'Unknown'
  };

  const result = await loginUser(parsed.data, telemetry);
  return respondWithAuth(response, result.user, result.tokens.accessToken, result.tokens.refreshToken);
}

export async function refresh(request: Request, response: Response) {
  // Refresh token body ya cookie dono me se kisi ek se le sakte hain.
  const payload = refreshSchema.safeParse({
    refreshToken: request.body.refreshToken ?? request.cookies?.refreshToken
  });

  if (!payload.success || !payload.data.refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  const result = await refreshAuthToken(payload.data.refreshToken);
  return respondWithAuth(response, result.user, result.tokens.accessToken, result.tokens.refreshToken);
}

export async function logout(request: Request, response: Response) {
  // Agar refresh token mila to usko revoke kar dete hain.
  const refreshToken = request.body.refreshToken ?? request.cookies?.refreshToken;

  if (refreshToken) {
    await logoutUser(refreshToken);
  }

  response.clearCookie('refreshToken', refreshCookieOptions);
  response.status(200).json({ success: true, message: 'Logged out successfully' });
}

export async function forgot(request: Request, response: Response): Promise<void> {
  // Forgot password flow me email validate karke reset token generate hota hai.
  const parsed = forgotPasswordSchema.safeParse(request.body);

  if (!parsed.success) {
    throw new AppError('Validation failed', 400);
  }

  const result = await forgotPassword(parsed.data);
  response.status(200).json({ success: true, message: 'If the email exists, a reset token has been created.', resetToken: result.resetToken });
}

export async function reset(request: Request, response: Response): Promise<void> {
  // Reset token aur new password ko validate karke password change hota hai.
  const parsed = resetPasswordSchema.safeParse(request.body);

  if (!parsed.success) {
    throw new AppError('Validation failed', 400);
  }

  const result = await resetPassword(parsed.data);
  response.status(200).json(result);
}

export async function changeMasterPassword(request: Request, response: Response): Promise<void> {
  // Protected route hai, isliye auth context me userId honi chahiye.
  if (!request.auth?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const parsed = changePasswordSchema.safeParse(request.body);

  if (!parsed.success) {
    throw new AppError('Validation failed', 400);
  }

  const result = await changePassword({ userId: request.auth.userId, ...parsed.data });
  response.status(200).json(result);
}
