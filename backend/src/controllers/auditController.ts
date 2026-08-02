import { type Request, type Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { getAuditLogs } from '../services/auditReadService';

export async function readAuditLogs(request: Request, response: Response): Promise<void> {
  // Activity history bhi sirf logged-in user ko dikhayi jaati hai.
  if (!request.auth?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const logs = await getAuditLogs(request.auth.userId);
  response.json({ success: true, data: logs });
}
