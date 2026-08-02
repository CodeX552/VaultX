import { listAuditLogs } from '../repositories/auditReadRepository';

export async function getAuditLogs(userId: string) {
  // UI ke recent activity panel ke liye latest audit events laate hain.
  return listAuditLogs(userId);
}
