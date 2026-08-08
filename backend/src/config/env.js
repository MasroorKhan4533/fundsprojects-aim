import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().max(65535).default(5001),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  MONGODB_URI: z.string().min(1),
  MONGODB_MAX_POOL_SIZE: z.coerce.number().int().positive().default(20),
  MONGODB_MIN_POOL_SIZE: z.coerce.number().int().nonnegative().default(2),
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("8h"),
  COOKIE_NAME: z.string().min(1).default("aim_token"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(500),
  REQUEST_BODY_LIMIT: z.string().default("1mb"),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment configuration: ${details}`);
}

const raw = parsed.data;

export const env = Object.freeze({
  nodeEnv: raw.NODE_ENV,
  port: raw.PORT,
  frontendUrl: raw.FRONTEND_URL,
  mongo: Object.freeze({
    uri: raw.MONGODB_URI,
    maxPoolSize: raw.MONGODB_MAX_POOL_SIZE,
    minPoolSize: raw.MONGODB_MIN_POOL_SIZE,
    serverSelectionTimeoutMS: raw.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
  }),
  auth: Object.freeze({
    jwtSecret: raw.JWT_SECRET,
    jwtExpiresIn: raw.JWT_EXPIRES_IN,
    cookieName: raw.COOKIE_NAME,
  }),
  logLevel: raw.LOG_LEVEL,
  rateLimit: Object.freeze({
    windowMs: raw.RATE_LIMIT_WINDOW_MS,
    max: raw.RATE_LIMIT_MAX,
  }),
  requestBodyLimit: raw.REQUEST_BODY_LIMIT,
  shutdownTimeoutMs: raw.SHUTDOWN_TIMEOUT_MS,
  isProduction: raw.NODE_ENV === "production",
  isTest: raw.NODE_ENV === "test",
});
