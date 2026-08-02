import { type NextFunction, type Request, type Response } from 'express';
import { logger } from '../config/logger';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function notFoundHandler(_request: Request, _response: Response, next: NextFunction): void {
  // Unknown routes ko 404 app error me convert karte hain.
  next(new AppError('Route not found', 404));
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction): void {
  // Centralized error response, internal details leak nahi hote.
  const appError = error instanceof AppError ? error : new AppError('Internal server error', 500);

  logger.error(appError.message, { stack: error instanceof Error ? error.stack : undefined });

  response.status(appError.statusCode).json({
    success: false,
    message: appError.statusCode === 500 ? 'Internal server error' : appError.message
  });
}
