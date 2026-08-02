import { Router } from 'express';
import { readAuditLogs } from '../controllers/auditController';
import { requireAuth } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const auditRoutes = Router();

// Audit logs bhi user-specific aur protected hain.
auditRoutes.use(requireAuth);
auditRoutes.get('/', asyncHandler(readAuditLogs));

export default auditRoutes;
