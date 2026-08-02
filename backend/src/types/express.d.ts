import type { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload & {
        userId: string;
        email: string;
        tokenType: 'access' | 'refresh';
        jti: string;
      };
    }
  }
}

export {};
