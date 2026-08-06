import { Router } from 'express';
import authRoutes from './authRoutes';
import auditRoutes from './auditRoutes';
import dashboardRoutes from './dashboardRoutes';
import healthRoutes from './healthRoutes';
import vaultRoutes from './vaultRoutes';
import sessionRoutes from './sessionRoutes';
import threatRoutes from './threatRoutes';
import fileVaultRoutes from './fileVaultRoutes';
import scannerRoutes from './scannerRoutes';

const router = Router();

// Feature-wise route modules ko yahan aggregate kiya gaya hai.
router.use(authRoutes);
router.use('/health', healthRoutes);
router.use('/vault', vaultRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/sessions', sessionRoutes);
router.use('/threats', threatRoutes);
router.use('/file-vault', fileVaultRoutes);
router.use('/scanner', scannerRoutes);

export default router;
