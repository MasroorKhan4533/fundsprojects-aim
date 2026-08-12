import { env } from "../config/env.js";
import { AppError } from "../core/errors/app-error.js";
import { verifyAccessToken } from "../core/security/tokens.js";
import User from "../features/users/user.model.js";

export const authenticate = async (req, _res, next) => {
  try {
    let token = req.cookies?.[env.auth.accessCookieName];
    const authorization = req.headers.authorization;
    if (!token && authorization?.startsWith("Bearer ")) token = authorization.slice(7).trim();

    if (!token) {
      throw new AppError("Authentication required", { statusCode: 401, code: "AUTH_REQUIRED" });
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (!user || user.status !== "ACTIVE" || user.tokenVersion !== payload.ver) {
      throw new AppError("User account is unavailable", { statusCode: 401, code: "AUTH_INVALID" });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
