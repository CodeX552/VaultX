import { Router } from 'express';
import { getHealthStatus } from '../controllers/healthController';

const healthRoutes = Router();

// Health endpoint public rakha gaya hai taaki monitoring easy ho.
healthRoutes.get('/', getHealthStatus);

export default healthRoutes;
