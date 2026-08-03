import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { getSessions, revokeSession } from '../controllers/sessionController';

const router = Router();

router.use(requireAuth);

router.get('/', getSessions);
router.delete('/:id', revokeSession);

export default router;
