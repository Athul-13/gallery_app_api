import dotenv from 'dotenv'
import { z } from 'zod'

// Load environment variables
dotenv.config()

// Environment variables schema validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
  CORS_ORIGIN: z.string().optional(),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  PASSWORD_RESET_TOKEN_EXPIRES_IN: z.string().default('1h'),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET_NAME: z.string().min(1, 'S3 bucket name is required'),
  AWS_S3_BUCKET_URL: z.string().optional(),
  AWS_MAX_FILE_SIZE: z.string().default('5242880'), // 5MB in bytes
  AWS_ALLOWED_MIME_TYPES: z.string().default('image/jpeg,image/png,image/webp,image/gif'),
  AWS_S3_ACL: z.string().default('public-read'),
  // Email configuration (optional - only needed for production)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_SECURE: z.string().default('false'), // 'true' for 465, 'false' for other ports
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('noreply@galley.app'),
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
  CORS_ORIGIN,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  PASSWORD_RESET_TOKEN_EXPIRES_IN,
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME,
  AWS_S3_BUCKET_URL,
  AWS_MAX_FILE_SIZE,
  AWS_ALLOWED_MIME_TYPES,
  AWS_S3_ACL,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
} = env
