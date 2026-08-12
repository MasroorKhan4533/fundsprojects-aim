import { AppError } from "../core/errors/app-error.js";

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({
    body: req.body ?? {},
    params: req.params ?? {},
    query: req.query ?? {},
  });

  if (!result.success) {
    return next(new AppError("Validation failed", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details: result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    }));
  }

  req.validated = result.data;
  return next();
};
