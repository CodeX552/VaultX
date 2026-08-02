import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/authMiddleware';

const dashboardRoutes = Router();

// Dashboard stats sirf authenticated user ke liye available hain.
dashboardRoutes.use(requireAuth);
dashboardRoutes.get('/', asyncHandler(getDashboardStats));

export default dashboardRoutes;
