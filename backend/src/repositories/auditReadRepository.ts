import { prisma } from '../database/prisma';

export function listAuditLogs(userId: string, limit = 20) {
  // Recent actions ko latest-first order me return karte hain.
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}
