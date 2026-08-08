import { sendSuccess } from "../../core/http/response.js";
import { createTarget, deleteTarget, listTargets, updateTarget } from "./target.service.js";

const contextFrom = (req) => ({ requestId: req.requestId, ip: req.ip, userAgent: req.get("user-agent") || "" });

export const listTargetsController = async (req, res) => {
  const result = await listTargets(req.validated.query, req.user);
  return sendSuccess(res, { data: result.items, meta: result.meta });
};

export const createTargetController = async (req, res) => {
  const target = await createTarget(req.validated.body, req.user, contextFrom(req));
  return sendSuccess(res, { statusCode: 201, message: "Target created", data: { target } });
};

export const updateTargetController = async (req, res) => {
  const target = await updateTarget(req.validated.params.id, req.validated.body, req.user, contextFrom(req));
  return sendSuccess(res, { message: "Target updated", data: { target } });
};

export const deleteTargetController = async (req, res) => {
  await deleteTarget(req.validated.params.id, req.user, contextFrom(req));
  return sendSuccess(res, { message: "Target deleted" });
};
