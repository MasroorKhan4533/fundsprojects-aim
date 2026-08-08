import pino from "pino";
import { env } from "../config/env.js";

const transport =
  env.nodeEnv === "development"
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined;

export const logger = pino({
  level: env.logLevel,
  base: {
    service: "fundsprojects-aim-api",
    environment: env.nodeEnv,
  },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "passwordHash",
      "token",
      "refreshToken",
    ],
    censor: "[REDACTED]",
  },
  transport,
});
