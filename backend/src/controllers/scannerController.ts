import { type Request, type Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { scanHeaders } from '../services/headerScannerService';

export async function scanWebsiteHeaders(request: Request, response: Response): Promise<void> {
  if (!request.auth?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const { url } = request.body;

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    throw new AppError('A valid URL starting with http:// or https:// is required', 400);
  }

  const result = await scanHeaders(url);
  response.status(200).json({ success: true, data: result });
}
