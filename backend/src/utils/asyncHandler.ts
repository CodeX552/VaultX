import { type NextFunction, type Request, type RequestHandler, type Response } from 'express';

export function asyncHandler(handler: (request: Request, response: Response, next: NextFunction) => Promise<void> | void): RequestHandler {
  // Async route errors ko Express ke next() tak safely pass karte hain.
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}
