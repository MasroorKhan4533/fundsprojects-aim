import { AppError } from "../core/errors/app-error.js";

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError("You do not have permission to perform this action", {
      statusCode: 403,
      code: "FORBIDDEN",
    }));
  }
  return next();
};
