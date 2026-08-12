import rateLimit from "express-rate-limit";

const createLimiter = ({ windowMs, limit, message }) => rateLimit({
  windowMs,
  limit,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ success: false, code: "RATE_LIMITED", message }),
});

export const loginRateLimit = createLimiter({ windowMs: 15 * 60_000, limit: 20, message: "Too many sign-in attempts. Please try again later." });
export const registrationRateLimit = createLimiter({ windowMs: 60 * 60_000, limit: 10, message: "Too many registration requests. Please try again later." });
export const passwordRateLimit = createLimiter({ windowMs: 30 * 60_000, limit: 10, message: "Too many password requests. Please try again later." });
