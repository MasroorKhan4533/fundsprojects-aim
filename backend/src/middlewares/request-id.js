import crypto from "node:crypto";

const requestIdPattern = /^[a-zA-Z0-9._:-]{8,128}$/;

export const requestId = (req, res, next) => {
  const supplied = req.get("x-request-id");
  const id = supplied && requestIdPattern.test(supplied) ? supplied : crypto.randomUUID();

  req.requestId = id;
  res.locals.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
};
