import { Router } from 'express';
import { addVaultItem, deleteVaultItem, editVaultItem, exportVault, getVaultItems, importVault, viewVaultHistory, viewVaultPassword } from '../controllers/vaultController';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/authMiddleware';

const vaultRoutes = Router();

// Vault routes auth-protected hain, isliye middleware pehle lagaya gaya hai.
vaultRoutes.use(requireAuth);
vaultRoutes.get('/', asyncHandler(getVaultItems));
vaultRoutes.post('/', asyncHandler(addVaultItem));
// CSV export/import ko parameterized routes se pehle define karna zaroori hai.
vaultRoutes.get('/export', asyncHandler(exportVault));
vaultRoutes.post('/import', asyncHandler(importVault));
vaultRoutes.get('/:id/password', asyncHandler(viewVaultPassword));
vaultRoutes.get('/:id/history', asyncHandler(viewVaultHistory));
vaultRoutes.put('/:id', asyncHandler(editVaultItem));
vaultRoutes.delete('/:id', asyncHandler(deleteVaultItem));

export default vaultRoutes;
