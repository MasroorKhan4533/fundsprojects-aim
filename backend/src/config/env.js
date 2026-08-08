import "dotenv/config";
import { z } from "zod";

const optionalString = z.string().optional().transform((value) => value?.trim() || "");
const optionalBoolean = z.enum(["true", "false"]).optional().transform((value) => {
  if (value === undefined) return undefined;
  return value === "true";
});

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().max(65535).default(5001),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  MONGODB_URI: z.string().min(1),
  MONGODB_MAX_POOL_SIZE: z.coerce.number().int().positive().default(20),
  MONGODB_MIN_POOL_SIZE: z.coerce.number().int().nonnegative().default(2),
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  JWT_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().min(5).max(1440).default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(7),
  REMEMBER_ME_REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(180).default(30),
  ACCESS_COOKIE_NAME: z.string().min(1).default("aim_access_token"),
  REFRESH_COOKIE_NAME: z.string().min(1).default("aim_refresh_token"),
  COOKIE_SECURE: optionalBoolean,
  ACTIVATION_TOKEN_TTL_MINUTES: z.coerce.number().int().min(15).max(10080).default(1440),
  PASSWORD_RESET_TOKEN_TTL_MINUTES: z.coerce.number().int().min(5).max(1440).default(30),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  LOGIN_MAX_FAILURES: z.coerce.number().int().min(3).max(20).default(5),
  LOGIN_LOCK_MINUTES: z.coerce.number().int().min(1).max(1440).default(15),
  SMTP_HOST: z.string().min(1).default("127.0.0.1"),
  SMTP_PORT: z.coerce.number().int().positive().max(65535).default(1025),
  SMTP_SECURE: z.string().default("false").transform((value) => value === "true"),
  SMTP_USER: optionalString,
  SMTP_PASSWORD: optionalString,
  EMAIL_FROM: z.string().min(3).default("FundsProjects AIM <no-reply@fundsprojects.local>"),
  EMAIL_DELIVERY_MODE: z.enum(["smtp", "test"]).default("smtp"),
  BOOTSTRAP_ADMIN_FULL_NAME: z.string().min(2).default("FundsProjects Admin"),
  BOOTSTRAP_ADMIN_EMAIL: z.string().email().default("admin@fundsprojects.local"),
  BOOTSTRAP_ADMIN_MOBILE: z.string().min(8).default("+919999999999"),
  BOOTSTRAP_ADMIN_DESIGNATION: z.string().min(2).default("Administrator"),
  BOOTSTRAP_ADMIN_PASSWORD: z.string().min(10).default("Admin@12345"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(500),
  REQUEST_BODY_LIMIT: z.string().default("1mb"),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  LOCAL_STORAGE_DIR: z.string().min(1).default("storage/private"),
  MAX_UPLOAD_MB: z.coerce.number().int().min(1).max(50).default(10),
  S3_BUCKET: optionalString,
  S3_REGION: optionalString,
  S3_PREFIX: z.string().default("private"),
}).superRefine((data, ctx) => {
  if (data.STORAGE_PROVIDER === "s3") {
    if (!data.S3_BUCKET) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["S3_BUCKET"], message: "S3_BUCKET is required when STORAGE_PROVIDER=s3" });
    }
    if (!data.S3_REGION) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["S3_REGION"], message: "S3_REGION is required when STORAGE_PROVIDER=s3" });
    }
  }
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
    accessTokenTtlMinutes: raw.ACCESS_TOKEN_TTL_MINUTES,
    refreshTokenTtlDays: raw.REFRESH_TOKEN_TTL_DAYS,
    rememberMeRefreshTokenTtlDays: raw.REMEMBER_ME_REFRESH_TOKEN_TTL_DAYS,
    accessCookieName: raw.ACCESS_COOKIE_NAME,
    refreshCookieName: raw.REFRESH_COOKIE_NAME,
    cookieSecure: raw.COOKIE_SECURE ?? raw.NODE_ENV === "production",
    activationTokenTtlMinutes: raw.ACTIVATION_TOKEN_TTL_MINUTES,
    passwordResetTokenTtlMinutes: raw.PASSWORD_RESET_TOKEN_TTL_MINUTES,
    bcryptRounds: raw.BCRYPT_ROUNDS,
    loginMaxFailures: raw.LOGIN_MAX_FAILURES,
    loginLockMinutes: raw.LOGIN_LOCK_MINUTES,
  }),
  smtp: Object.freeze({
    host: raw.SMTP_HOST,
    port: raw.SMTP_PORT,
    secure: raw.SMTP_SECURE,
    user: raw.SMTP_USER,
    password: raw.SMTP_PASSWORD,
    from: raw.EMAIL_FROM,
    deliveryMode: raw.EMAIL_DELIVERY_MODE,
  }),
  bootstrapAdmin: Object.freeze({
    fullName: raw.BOOTSTRAP_ADMIN_FULL_NAME,
    email: raw.BOOTSTRAP_ADMIN_EMAIL,
    mobile: raw.BOOTSTRAP_ADMIN_MOBILE,
    designation: raw.BOOTSTRAP_ADMIN_DESIGNATION,
    password: raw.BOOTSTRAP_ADMIN_PASSWORD,
  }),
  logLevel: raw.LOG_LEVEL,
  rateLimit: Object.freeze({
    windowMs: raw.RATE_LIMIT_WINDOW_MS,
    max: raw.RATE_LIMIT_MAX,
  }),
  requestBodyLimit: raw.REQUEST_BODY_LIMIT,
  shutdownTimeoutMs: raw.SHUTDOWN_TIMEOUT_MS,
  storage: Object.freeze({
    provider: raw.STORAGE_PROVIDER,
    localDir: raw.LOCAL_STORAGE_DIR,
    maxUploadBytes: raw.MAX_UPLOAD_MB * 1024 * 1024,
    s3: Object.freeze({
      bucket: raw.S3_BUCKET,
      region: raw.S3_REGION,
      prefix: raw.S3_PREFIX.replace(/^\/+|\/+$/g, "") || "private",
    }),
  }),
  isProduction: raw.NODE_ENV === "production",
  isTest: raw.NODE_ENV === "test",
});
