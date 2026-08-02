import crypto from 'crypto';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import type { TokenPair } from '../types/auth';

export interface TokenClaims extends JwtPayload {
  userId: string;
  email: string;
  tokenType: 'access' | 'refresh';
  jti: string;
}

// Ek hi user ke liye access aur refresh token pair banate hain.
export function createTokenPair(user: { id: string; email: string }): TokenPair {
  const jti = crypto.randomUUID();
  const baseClaims = {
    userId: user.id,
    email: user.email,
    jti
  };

  // Short-lived access token API calls ke liye hota hai.
  const accessToken = jwt.sign({ ...baseClaims, tokenType: 'access' }, env.JWT_ACCESS_SECRET, {
    expiresIn: '15m'
  });

  // Long-lived refresh token session ko renew karne ke kaam aata hai.
  const refreshToken = jwt.sign({ ...baseClaims, tokenType: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d'
  });

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string) {
  // Access token ko access secret se verify kiya jata hai.
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenClaims;
}

export function verifyRefreshToken(token: string) {
  // Refresh token ko alag secret se verify karte hain.
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenClaims;
}

export function hashToken(token: string) {
  // Token ka SHA-256 hash DB me store karne ke liye.
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateOpaqueToken() {
  // Reset password ke liye random one-time token generate hota hai.
  return crypto.randomBytes(32).toString('hex');
}
