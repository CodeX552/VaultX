import { prisma } from '../database/prisma';

export function createPasswordResetToken(data: { userId: string; tokenHash: string; expiresAt: Date }) {
  // Temporary reset token hash ke form me DB me store hota hai.
  return prisma.passwordResetToken.create({
    data
  });
}

export function findPasswordResetTokenByHash(tokenHash: string) {
  // Reset token ke saath linked user bhi load karte hain.
  return prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true }
  });
}

export function markPasswordResetTokenUsed(tokenHash: string) {
  // One-time token ko used mark karke replay rok dete hain.
  return prisma.passwordResetToken.update({
    where: { tokenHash },
    data: { usedAt: new Date() }
  });
}
