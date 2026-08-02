import { type Request, type Response } from 'express';

export function getHealthStatus(_request: Request, response: Response): void {
  // Simple health check endpoint jo service availability batata hai.
  response.status(200).json({
    success: true,
    message: 'VaultX backend is running',
    timestamp: new Date().toISOString()
  });
}
