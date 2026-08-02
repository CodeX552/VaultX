import { prisma } from '../database/prisma';

export function createPasswordHistory(data: {
  vaultItemId: string;
  encryptedPassword: string;
  iv: string;
  authTag: string;
}) {
  // Old encrypted password ko history table me preserve karte hain.
  return prisma.passwordHistory.create({
    data
  });
}

export function listPasswordHistory(vaultItemId: string) {
  // History entries ko newest-first bhejna useful hota hai.
  return prisma.passwordHistory.findMany({
    where: { vaultItemId },
    orderBy: { createdAt: 'desc' }
  });
}
