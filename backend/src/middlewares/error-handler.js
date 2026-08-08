import { ZodError } from "zod";
import { AppError } from "../core/errors/app-error.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

export const errorHandler = (error, req, res, _next) => {
  let normalized = error;

  if (error instanceof ZodError) {
    normalized = new AppError("Validation failed", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
      cause: error,
    });
  }

  if (!(normalized instanceof AppError)) {
    normalized = new AppError("Internal server error", {
      statusCode: 500,
      code: "INTERNAL_ERROR",
      cause: error,
    });
  }

  logger[normalized.statusCode >= 500 ? "error" : "warn"](
    {
      err: error,
      requestId: req.requestId,
      code: normalized.code,
      statusCode: normalized.statusCode,
    },
    normalized.message
  );

  const response = {
    success: false,
    message: normalized.message,
    code: normalized.code,
    requestId: req.requestId,
  };

  if (normalized.details) response.details = normalized.details;
  if (!env.isProduction && normalized.statusCode >= 500) response.stack = error.stack;

  res.status(normalized.statusCode).json(response);
};
