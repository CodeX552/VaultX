import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { env } from './config/env';

export function createApp() {
  // Express app ko yahan bootstrap karke security middleware chain lagayi ja rahi hai.
  const app = express();

  // Helmet headers se common security hardening milti hai.
  app.use(helmet());
  app.use(
    cors({
      // Frontend origin allow kiya gaya hai, credentials ke saath.
      origin: env.CLIENT_URL,
      credentials: true
    })
  );
  // Compression response size kam karta hai.
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  // Cookies se refresh token aur similar flows handle hote hain.
  app.use(cookieParser());
  // Request logs debugging aur audit ke kaam aate hain.
  app.use(morgan('dev'));
  app.use(
    rateLimit({
      // Basic rate limit abuse ko slow karta hai.
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  // Health/ready endpoint for quick smoke checks.
  app.get('/api', (_request, response) => {
    response.json({ success: true, message: 'VaultX API ready' });
  });

  // Sare feature routes /api ke under mount kiye gaye hain.
  app.use('/api', routes);
  // Unknown route pe central not-found handler.
  app.use(notFoundHandler);
  // Last me centralized error handler.
  app.use(errorHandler);

  return app;
}
