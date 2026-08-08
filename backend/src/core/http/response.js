export const sendSuccess = (res, { statusCode = 200, data = null, message = "OK", meta } = {}) => {
  const body = {
    success: true,
    message,
    data,
    requestId: res.locals.requestId,
  };

  if (meta !== undefined) body.meta = meta;
  return res.status(statusCode).json(body);
};
