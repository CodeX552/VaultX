import { Router } from 'express';
import authRoutes from './authRoutes';
import auditRoutes from './auditRoutes';
import dashboardRoutes from './dashboardRoutes';
import healthRoutes from './healthRoutes';
import vaultRoutes from './vaultRoutes';

const router = Router();

// Feature-wise route modules ko yahan aggregate kiya gaya hai.
router.use(authRoutes);
router.use('/health', healthRoutes);
router.use('/vault', vaultRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/audit-logs', auditRoutes);

export default router;
