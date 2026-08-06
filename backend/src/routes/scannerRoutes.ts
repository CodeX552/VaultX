import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';
import { scanWebsiteHeaders } from '../controllers/scannerController';

const router = Router();
router.use(requireAuth);

router.post('/headers', asyncHandler(scanWebsiteHeaders));

export default router;
