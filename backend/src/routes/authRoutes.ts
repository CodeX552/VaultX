import { Router } from 'express';
import { changeMasterPassword, forgot, login, logout, refresh, register, reset } from '../controllers/authController';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/authMiddleware';

const authRoutes = Router();

// Auth lifecycle ke sab endpoints yahan register hote hain.
authRoutes.post('/register', asyncHandler(register));
authRoutes.post('/login', asyncHandler(login));
authRoutes.post('/refresh', asyncHandler(refresh));
authRoutes.post('/logout', asyncHandler(logout));
authRoutes.post('/forgot-password', asyncHandler(forgot));
authRoutes.post('/reset-password', asyncHandler(reset));
authRoutes.put('/change-password', requireAuth, asyncHandler(changeMasterPassword));

export default authRoutes;
