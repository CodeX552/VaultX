import { createAuditLog } from '../repositories/auditRepository';

export function recordAuditEvent(data: {
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
  // Audit event ek central place par persist hota hai.
  return createAuditLog(data);
}
