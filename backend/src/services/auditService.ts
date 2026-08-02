import { createAuditLog } from '../repositories/auditRepository';

export function recordAuditEvent(data: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: unknown;
}) {
  // Audit event ek central place par persist hota hai.
  return createAuditLog(data);
}
