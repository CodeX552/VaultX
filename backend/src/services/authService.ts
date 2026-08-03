import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { createRefreshToken, findRefreshTokenByHash, revokeRefreshToken, revokeUserRefreshTokens } from '../repositories/refreshTokenRepository';
import { createUser, findUserByEmail } from '../repositories/userRepository';
import { createPasswordResetToken, findPasswordResetTokenByHash, markPasswordResetTokenUsed } from '../repositories/passwordResetRepository';
import { createTokenPair, generateOpaqueToken, hashToken, verifyRefreshToken } from '../utils/token';
import { recordAuditEvent } from './auditService';
import { prisma } from '../database/prisma';
import { analyzeLoginRisk, TelemetryData } from './riskService';
import type { AuthUser, TokenPair } from '../types/auth';

// DB user record ko frontend-safe auth user shape me convert karta hai.
function toAuthUser(user: {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

// Refresh token ko verify karke uska hash aur expiry DB me store karte hain.
function persistRefreshToken(userId: string, refreshToken: string, telemetry?: TelemetryData, riskResult?: any) {
  const decoded = verifyRefreshToken(refreshToken);

  if (typeof decoded.exp !== 'number') {
    throw new AppError('Refresh token is missing an expiry claim', 400);
  }

  return prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(decoded.exp * 1000),
      ip: telemetry?.ip,
      browser: riskResult?.browser,
      os: riskResult?.os,
      country: riskResult?.country
    }
  });
}

export async function registerUser(input: { name: string; email: string; password: string }, telemetry?: TelemetryData) {
  // Same email pe duplicate account allow nahi hai.
  const existingUser = await findUserByEmail(input.email.toLowerCase());

  if (existingUser) {
    throw new AppError('A user with that email already exists', 409);
  }

  // Master password ko bcrypt se hash kar rahe hain.
  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);
  const user = await createUser({
    name: input.name.trim(),
    email: input.email.toLowerCase(),
    passwordHash
  });

  let riskResult;
  if (telemetry) {
    telemetry.userId = user.id;
    riskResult = await analyzeLoginRisk(telemetry);
  }

  // Login ke liye access token aur refresh token dono create karte hain.
  const tokens = createTokenPair({ id: user.id, email: user.email });
  await persistRefreshToken(user.id, tokens.refreshToken, telemetry, riskResult);
  await recordAuditEvent({ 
    userId: user.id, action: 'AUTH_REGISTER', entity: 'user', entityId: user.id, metadata: { email: user.email },
    ip: telemetry?.ip, userAgent: telemetry?.userAgent, browser: riskResult?.browser, os: riskResult?.os, country: riskResult?.country, riskScore: riskResult?.score
  });

  return {
    user: toAuthUser(user),
    tokens
  };
}

export async function loginUser(input: { email: string; password: string }, telemetry?: TelemetryData) {
  // Email se user dhoondh ke password verify karte hain.
  const user = await findUserByEmail(input.email.toLowerCase());

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError('Invalid email or password', 401);
  }

  let riskResult;
  if (telemetry) {
    telemetry.userId = user.id;
    riskResult = await analyzeLoginRisk(telemetry);
    
    // Optionally block extremely high risk
    if (riskResult.isHighRisk) {
      await recordAuditEvent({ 
        userId: user.id, action: 'AUTH_LOGIN_BLOCKED_RISK', entity: 'user', entityId: user.id, metadata: { factors: riskResult.factors },
        ip: telemetry.ip, userAgent: telemetry.userAgent, browser: riskResult.browser, os: riskResult.os, country: riskResult.country, riskScore: riskResult.score
      });
      // throw new AppError('Login blocked due to suspicious activity. Please verify your identity.', 403);
      // For now, we only alert and let them through, but this demonstrates the capability.
    }
  }

  // Purane refresh tokens invalidate kar rahe hain.
  await revokeUserRefreshTokens(user.id);

  const tokens = createTokenPair({ id: user.id, email: user.email });
  await persistRefreshToken(user.id, tokens.refreshToken, telemetry, riskResult);
  await recordAuditEvent({ 
    userId: user.id, action: 'AUTH_LOGIN', entity: 'user', entityId: user.id, metadata: { factors: riskResult?.factors },
    ip: telemetry?.ip, userAgent: telemetry?.userAgent, browser: riskResult?.browser, os: riskResult?.os, country: riskResult?.country, riskScore: riskResult?.score
  });

  return {
    user: toAuthUser(user),
    tokens
  };
}

export async function refreshAuthToken(refreshToken: string) {
  // Refresh token ka hash DB me match karke rotation ensure karte hain.
  const tokenHash = hashToken(refreshToken);
  const storedToken = await findRefreshTokenByHash(tokenHash);

  if (!storedToken || storedToken.revokedAt) {
    throw new AppError('Invalid refresh token', 401);
  }

  const decoded = verifyRefreshToken(refreshToken);

  if (decoded.tokenType !== 'refresh' || decoded.userId !== storedToken.userId) {
    throw new AppError('Invalid refresh token', 401);
  }

  // Purana refresh token revoke karke naya issue karte hain.
  await revokeRefreshToken(tokenHash);

  const tokens = createTokenPair({ id: storedToken.user.id, email: storedToken.user.email });
  await persistRefreshToken(storedToken.user.id, tokens.refreshToken);

  return {
    user: toAuthUser(storedToken.user),
    tokens
  };
}

export async function logoutUser(refreshToken: string) {
  // Logout par current refresh token ko revoke kar dete hain.
  const tokenHash = hashToken(refreshToken);
  const storedToken = await findRefreshTokenByHash(tokenHash);

  if (storedToken && !storedToken.revokedAt) {
    await revokeRefreshToken(tokenHash);
    await recordAuditEvent({ userId: storedToken.userId, action: 'AUTH_LOGOUT', entity: 'user', entityId: storedToken.userId });
  }

  return { success: true };
}

export async function forgotPassword(input: { email: string }) {
  // Email exist ho to temporary reset token generate hota hai.
  const user = await findUserByEmail(input.email.toLowerCase());

  if (!user) {
    return { success: true };
  }

  const resetToken = generateOpaqueToken();
  const tokenHash = hashToken(resetToken);

  await createPasswordResetToken({
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000)
  });

  await recordAuditEvent({
    userId: user.id,
    action: 'AUTH_FORGOT_PASSWORD',
    entity: 'user',
    entityId: user.id
  });

  return {
    success: true,
    resetToken: env.NODE_ENV === 'production' ? undefined : resetToken
  };
}

export async function resetPassword(input: { email: string; resetToken: string; newPassword: string }) {
  // Reset request me token hash, expiry, aur user match sab verify hote hain.
  const user = await findUserByEmail(input.email.toLowerCase());

  if (!user) {
    throw new AppError('Invalid reset request', 400);
  }

  const tokenHash = hashToken(input.resetToken);
  const record = await findPasswordResetTokenByHash(tokenHash);

  if (!record || record.userId !== user.id || record.usedAt || record.expiresAt < new Date()) {
    throw new AppError('Invalid reset request', 400);
  }

  const passwordHash = await bcrypt.hash(input.newPassword, env.BCRYPT_SALT_ROUNDS);

  // Password update aur token usage ek hi transaction me hota hai.
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    markPasswordResetTokenUsed(tokenHash),
    revokeUserRefreshTokens(user.id)
  ]);

  await recordAuditEvent({ userId: user.id, action: 'AUTH_RESET_PASSWORD', entity: 'user', entityId: user.id });

  return { success: true };
}

export async function changePassword(input: { userId: string; currentPassword: string; newPassword: string }) {
  // Current password check karke hi master password change allow hota hai.
  const user = await prisma.user.findUnique({ where: { id: input.userId } });

  if (!user) {
    throw new AppError('Unauthorized', 401);
  }

  const matches = await bcrypt.compare(input.currentPassword, user.passwordHash);

  if (!matches) {
    throw new AppError('Current password is invalid', 400);
  }

  const passwordHash = await bcrypt.hash(input.newPassword, env.BCRYPT_SALT_ROUNDS);

  // Password update ke baad purane sessions ko revoke karte hain.
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    revokeUserRefreshTokens(user.id)
  ]);

  await recordAuditEvent({ userId: user.id, action: 'AUTH_CHANGE_PASSWORD', entity: 'user', entityId: user.id });

  return { success: true };
}
