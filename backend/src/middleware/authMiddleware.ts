import { type NextFunction, type Request, type Response } from 'express';
import { AppError } from './errorHandler';
import { verifyAccessToken } from '../utils/token';

export function requireAuth(request: Request, _response: Response, next: NextFunction): void {
  // Authorization header ya cookie dono me se token uthate hain.
  const authorizationHeader = request.headers.authorization;
  const bearerToken = authorizationHeader?.startsWith('Bearer ') ? authorizationHeader.slice(7) : undefined;
  const token = bearerToken ?? request.cookies?.accessToken;

  if (!token) {
    next(new AppError('Unauthorized', 401));
    return;
  }

  try {
    // Token valid ho to uska payload request me attach kar dete hain.
    request.auth = verifyAccessToken(token);
    next();
  } catch {
    // Token invalid ho to request ko reject kar dete hain.
    next(new AppError('Unauthorized', 401));
  }
}
