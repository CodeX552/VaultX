import { type Request, type Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { getDashboard } from '../services/vaultService';

export async function getDashboardStats(request: Request, response: Response): Promise<void> {
  // Dashboard stats sirf authenticated user ke liye available hain.
  if (!request.auth?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const stats = await getDashboard(request.auth.userId);
  response.json({ success: true, data: stats });
}
