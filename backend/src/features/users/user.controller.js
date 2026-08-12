import { sendSuccess } from "../../core/http/response.js";
import { changeRole, changeStatus, listUsers, resendActivation, reviewRegistration, sendAdminPasswordReset } from "./user.service.js";

const contextFrom = (req) => ({
  requestId: req.requestId,
  ip: req.ip,
  userAgent: req.get("user-agent") || "",
});

export const listUsersController = async (req, res) => {
  const result = await listUsers(req.validated.query);
  return sendSuccess(res, { data: result.items, meta: result.meta });
};

export const reviewRegistrationController = async (req, res) => {
  const user = await reviewRegistration(
    { id: req.validated.params.id, ...req.validated.body },
    req.user._id,
    contextFrom(req)
  );
  return sendSuccess(res, { message: req.validated.body.decision === "APPROVE" ? "Registration approved" : "Registration rejected", data: { user } });
};

export const resendActivationController = async (req, res) => {
  await resendActivation(req.validated.params.id, req.user._id, contextFrom(req));
  return sendSuccess(res, { message: "Activation email sent" });
};

export const changeRoleController = async (req, res) => {
  const user = await changeRole(req.validated.params.id, req.validated.body.role, req.user._id, contextFrom(req));
  return sendSuccess(res, { message: "User role updated", data: { user } });
};

export const changeStatusController = async (req, res) => {
  const user = await changeStatus(req.validated.params.id, req.validated.body.status, req.user._id, contextFrom(req));
  return sendSuccess(res, { message: "User status updated", data: { user } });
};

export const sendPasswordResetController = async (req, res) => {
  await sendAdminPasswordReset(req.validated.params.id, req.user._id, contextFrom(req));
  return sendSuccess(res, { message: "Password reset email sent" });
};
