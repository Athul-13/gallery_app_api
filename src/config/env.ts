import dotenv from 'dotenv'
import { z } from 'zod'

// Load environment variables
dotenv.config()

// Environment variables schema validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  PASSWORD_RESET_TOKEN_EXPIRES_IN: z.string().default('1h'),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET_NAME: z.string().optional(),
})

// Validate and parse environment variables
const envParseResult = envSchema.safeParse(process.env)

if (!envParseResult.success) {
  console.error('❌ Invalid environment variables:')
  console.error(envParseResult.error.format())
  process.exit(1)
}

export const env = envParseResult.data

// Export individual variables for convenience
export const {
  NODE_ENV,
  PORT,
  MONGODB_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  PASSWORD_RESET_TOKEN_EXPIRES_IN,
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME,
} = env
