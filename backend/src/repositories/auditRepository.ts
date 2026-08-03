import { prisma } from '../database/prisma';

export function createAuditLog(data: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: unknown;
  ip?: string | null;
  userAgent?: string | null;
  browser?: string | null;
  os?: string | null;
  country?: string | null;
  riskScore?: number | null;
}) {
  // Har security-relevant action ka audit trail yahan store hota hai.
  return prisma.auditLog.create({
    data: {
      userId: data.userId ?? null,
      action: data.action,
      entity: data.entity,
      entityId: data.entityId ?? null,
      metadata: data.metadata as never,
      ip: data.ip,
      userAgent: data.userAgent,
      browser: data.browser,
      os: data.os,
      country: data.country,
      riskScore: data.riskScore
    }
  });
}
