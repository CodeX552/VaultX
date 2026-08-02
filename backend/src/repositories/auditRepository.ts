import { prisma } from '../database/prisma';

export function createAuditLog(data: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: unknown;
}) {
  // Har security-relevant action ka audit trail yahan store hota hai.
  return prisma.auditLog.create({
    data: {
      userId: data.userId ?? null,
      action: data.action,
      entity: data.entity,
      entityId: data.entityId ?? null,
      metadata: data.metadata as never
    }
  });
}
