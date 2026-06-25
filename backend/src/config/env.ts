import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  CORS_ORIGIN: z.string().min(1).default('*'),
  DATABASE_URL: z.string().startsWith('mysql://'),
  SHADOW_DATABASE_URL: z.string().startsWith('mysql://').optional(),
});

export const env = envSchema.parse(process.env);
