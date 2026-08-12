import { AppError } from "../core/errors/app-error.js";

export const notFound = (req, _res, next) => {
  next(
    new AppError(`Route not found: ${req.method} ${req.originalUrl}`, {
      statusCode: 404,
      code: "ROUTE_NOT_FOUND",
    })
  );
};
