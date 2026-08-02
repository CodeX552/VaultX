import { prisma } from '../database/prisma';

export function createRefreshToken(data: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}) {
  // Refresh token ka hash store karte hain, raw token nahi.
  return prisma.refreshToken.create({
    data
  });
}

export function findRefreshTokenByHash(tokenHash: string) {
  // Rotation aur logout ke liye hash-based lookup use hota hai.
  return prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true }
  });
}

export function revokeRefreshToken(tokenHash: string) {
  // Existing refresh token ko invalid mark kar dete hain.
  return prisma.refreshToken.update({
    where: { tokenHash },
    data: { revokedAt: new Date() }
  });
}

export function revokeUserRefreshTokens(userId: string) {
  // Login/reset/change password ke baad purane sessions revoke hote hain.
  return prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() }
  });
}
