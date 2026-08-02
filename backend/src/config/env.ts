import dotenv from 'dotenv';
import { z } from 'zod';

// .env file load karke typed validation ke liye prepare kar rahe hain.
dotenv.config();

const envSchema = z.object({
  // Environment values ko strict schema se verify kar rahe hain.
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  ENCRYPTION_KEY: z.string().min(64, 'ENCRYPTION_KEY must be a 64-character hex key'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12)
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  // Invalid config milne par app ko early fail karte hain.
  throw new Error(`Invalid environment configuration: ${parsedEnv.error.message}`);
}

export const env = parsedEnv.data;
