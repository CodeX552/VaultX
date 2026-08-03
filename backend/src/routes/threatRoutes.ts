import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { getThreats, resolveThreat, getIncidentTimeline, exportThreats, analyzeThreatWithAI } from '../controllers/threatController';

const router = Router();

router.use(requireAuth);

router.get('/', getThreats);
router.get('/export', exportThreats);
router.get('/timeline', getIncidentTimeline);
router.get('/:id/analyze', analyzeThreatWithAI);
router.patch('/:id/resolve', resolveThreat);

export default router;
