import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';
import { deleteFileVaultItem, downloadFileVaultItem, listFileVaultItems, uploadFileVaultItem } from '../controllers/fileVaultController';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.use(requireAuth);

router.post('/upload', upload.single('file'), asyncHandler(uploadFileVaultItem));
router.get('/', asyncHandler(listFileVaultItems));
router.get('/:id/download', asyncHandler(downloadFileVaultItem));
router.delete('/:id', asyncHandler(deleteFileVaultItem));

export default router;
