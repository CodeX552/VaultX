import { type NextFunction, type Request, type Response } from 'express';
import { type ZodTypeAny } from 'zod';

type ValidatedProperty = 'body' | 'params' | 'query';

export function validateRequest(schema: ZodTypeAny, property: ValidatedProperty = 'body') {
  // Reusable validator jo request ka selected part schema se compare karta hai.
  return (request: Request, response: Response, next: NextFunction) => {
    const parsed = schema.safeParse(request[property]);

    if (!parsed.success) {
      return response.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten()
      });
    }

    request[property] = parsed.data;
    next();
  };
}
