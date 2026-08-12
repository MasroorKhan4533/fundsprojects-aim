import { AppError } from "../../core/errors/app-error.js";
import { recordAudit } from "../audit/audit.service.js";
import { AUDIT_ACTIONS } from "../auth/auth.constants.js";
import { issueActivation } from "../auth/auth.service.js";
import { sendPasswordResetEmail } from "../mail/mail.service.js";
import { env } from "../../config/env.js";
import { addMinutes, hashOpaqueToken, randomToken } from "../../core/security/tokens.js";
import OneTimeToken from "../auth/models/one-time-token.model.js";
import Session from "../auth/models/session.model.js";
import User from "./user.model.js";
import { toSafeUser } from "./user.presenter.js";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const requireUser = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new AppError("User not found", { statusCode: 404, code: "USER_NOT_FOUND" });
  return user;
};

const preventSelfSecurityChange = (actorUserId, targetUserId, action) => {
  if (String(actorUserId) === String(targetUserId)) {
    throw new AppError(`You cannot ${action} your own account from this screen`, {
      statusCode: 409,
      code: "SELF_SECURITY_CHANGE_NOT_ALLOWED",
    });
  }
};

const ensureAnotherActiveAdminExists = async (user) => {
  if (user.role !== "ADMIN" || user.status !== "ACTIVE") return;
  const count = await User.countDocuments({ role: "ADMIN", status: "ACTIVE", _id: { $ne: user._id } });
  if (count === 0) {
    throw new AppError("At least one active administrator must remain", {
      statusCode: 409,
      code: "LAST_ADMIN_PROTECTED",
    });
  }
};

export const listUsers = async ({ page, limit, status, role, search }) => {
  const filter = {};
  if (status) filter.status = status;
  if (role) filter.role = role;
  if (search) {
    const regex = new RegExp(escapeRegExp(search), "i");
    filter.$or = [{ fullName: regex }, { email: regex }, { mobile: regex }, { userId: regex }, { designation: regex }];
  }

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    items: items.map(toSafeUser),
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
};

export const reviewRegistration = async ({ id, decision, role, reason }, actorUserId, context) => {
  const user = await requireUser(id);
  if (!["PENDING", "REJECTED", "APPROVED"].includes(user.status)) {
    throw new AppError("This registration can no longer be reviewed", { statusCode: 409, code: "REGISTRATION_NOT_REVIEWABLE" });
  }

  if (decision === "REJECT") {
    user.status = "REJECTED";
    user.rejectedAt = new Date();
    user.rejectedBy = actorUserId;
    user.rejectionReason = reason;
    user.approvedAt = null;
    user.approvedBy = null;
    await user.save();
    await OneTimeToken.updateMany({ userId: user._id, purpose: "ACTIVATION", usedAt: null }, { $set: { usedAt: new Date() } });
    await recordAudit({ action: AUDIT_ACTIONS.USER_REJECTED, actorUserId, targetUserId: user._id, context, metadata: { reason } });
    return toSafeUser(user);
  }

  user.status = "APPROVED";
  user.role = role || "TEAM_MEMBER";
  user.approvedAt = new Date();
  user.approvedBy = actorUserId;
  user.rejectedAt = null;
  user.rejectedBy = null;
  user.rejectionReason = "";
  await user.save();

  await recordAudit({ action: AUDIT_ACTIONS.USER_APPROVED, actorUserId, targetUserId: user._id, context, metadata: { role: user.role } });
  await issueActivation({ user, actorUserId, context });
  return toSafeUser(user);
};

export const resendActivation = async (id, actorUserId, context) => {
  const user = await requireUser(id);
  if (user.status !== "APPROVED") {
    throw new AppError("Only approved accounts awaiting activation can receive an activation email", {
      statusCode: 409,
      code: "ACCOUNT_NOT_AWAITING_ACTIVATION",
    });
  }
  await issueActivation({ user, actorUserId, context });
  return { sent: true };
};

export const changeRole = async (id, nextRole, actorUserId, context) => {
  const user = await requireUser(id);
  if (user.role === nextRole) return toSafeUser(user);
  preventSelfSecurityChange(actorUserId, user._id, "change the role of");
  if (user.role === "ADMIN" && nextRole !== "ADMIN") await ensureAnotherActiveAdminExists(user);

  const previousRole = user.role;
  user.role = nextRole;
  user.tokenVersion += 1;
  await user.save();
  await Session.updateMany({ userId: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  await recordAudit({ action: AUDIT_ACTIONS.USER_ROLE_CHANGED, actorUserId, targetUserId: user._id, context, metadata: { from: previousRole, to: nextRole } });
  return toSafeUser(user);
};

export const changeStatus = async (id, nextStatus, actorUserId, context) => {
  const user = await requireUser(id);
  if (user.status === nextStatus) return toSafeUser(user);
  preventSelfSecurityChange(actorUserId, user._id, "change the status of");
  if (nextStatus === "DISABLED") await ensureAnotherActiveAdminExists(user);

  const previousStatus = user.status;
  user.status = nextStatus;
  user.disabledAt = nextStatus === "DISABLED" ? new Date() : null;
  user.disabledBy = nextStatus === "DISABLED" ? actorUserId : null;
  user.tokenVersion += 1;
  await user.save();
  await Session.updateMany({ userId: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  await recordAudit({ action: AUDIT_ACTIONS.USER_STATUS_CHANGED, actorUserId, targetUserId: user._id, context, metadata: { from: previousStatus, to: nextStatus } });
  return toSafeUser(user);
};

export const sendAdminPasswordReset = async (id, actorUserId, context) => {
  const user = await requireUser(id);
  if (user.status !== "ACTIVE") {
    throw new AppError("Password reset can only be sent to an active account", { statusCode: 409, code: "ACCOUNT_NOT_ACTIVE" });
  }

  await OneTimeToken.updateMany({ userId: user._id, purpose: "PASSWORD_RESET", usedAt: null }, { $set: { usedAt: new Date() } });
  const raw = randomToken();
  await OneTimeToken.create({
    userId: user._id,
    purpose: "PASSWORD_RESET",
    tokenHash: hashOpaqueToken(raw),
    expiresAt: addMinutes(env.auth.passwordResetTokenTtlMinutes),
    createdBy: actorUserId,
  });
  await sendPasswordResetEmail({ user, token: raw });
  await recordAudit({ action: AUDIT_ACTIONS.PASSWORD_RESET_REQUESTED, actorUserId, targetUserId: user._id, context, metadata: { initiatedByAdmin: true } });
  return { sent: true };
};
