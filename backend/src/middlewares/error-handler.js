import { ZodError } from "zod";
import { AppError } from "../core/errors/app-error.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const normalizeError = (error) => {
  if (error instanceof AppError) return error;
  if (error instanceof ZodError) {
    return new AppError("Validation failed", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      cause: error,
    });
  }
  if (error?.code === 11000) {
    return new AppError("A record with the same unique value already exists", {
      statusCode: 409,
      code: "DUPLICATE_RECORD",
      details: { fields: Object.keys(error.keyPattern || error.keyValue || {}) },
      cause: error,
    });
  }
  if (error?.name === "CastError") {
    return new AppError("Invalid resource identifier", { statusCode: 400, code: "INVALID_IDENTIFIER", cause: error });
  }
  if (error?.name === "ValidationError") {
    return new AppError("Database validation failed", {
      statusCode: 400,
      code: "DATABASE_VALIDATION_ERROR",
      details: Object.values(error.errors || {}).map((item) => ({ path: item.path, message: item.message })),
      cause: error,
    });
  }
  return new AppError("Internal server error", { statusCode: 500, code: "INTERNAL_ERROR", cause: error });
};

export const errorHandler = (error, req, res, _next) => {
  const normalized = normalizeError(error);
  logger[normalized.statusCode >= 500 ? "error" : "warn"](
    { err: error, requestId: req.requestId, code: normalized.code, statusCode: normalized.statusCode },
    normalized.message
  );
  const response = { success: false, message: normalized.message, code: normalized.code, requestId: req.requestId };
  if (normalized.details) response.details = normalized.details;
  if (!env.isProduction && normalized.statusCode >= 500) response.stack = error.stack;
  res.status(normalized.statusCode).json(response);
};
