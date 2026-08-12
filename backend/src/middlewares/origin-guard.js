import { env } from "../config/env.js";
import { AppError } from "../core/errors/app-error.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const originGuard = (req, _res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();
  const origin = req.get("origin");
  if (origin && origin !== env.frontendUrl) {
    return next(new AppError("Request origin is not allowed", { statusCode: 403, code: "ORIGIN_NOT_ALLOWED" }));
  }
  return next();
};
