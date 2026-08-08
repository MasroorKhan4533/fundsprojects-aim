import mongoose from "mongoose";
import { AppError } from "../../core/errors/app-error.js";
import { normalizeEmail, normalizeMobile, normalizeUserId, isEmailLike, isMobileLike } from "../../core/security/normalization.js";
import { hashPassword, verifyPassword } from "../../core/security/password.js";
import { addDays, addMinutes, hashOpaqueToken, randomToken, signAccessToken } from "../../core/security/tokens.js";
import { env } from "../../config/env.js";
import { recordAudit } from "../audit/audit.service.js";
import { sendActivationEmail, sendPasswordResetEmail } from "../mail/mail.service.js";
import User from "../users/user.model.js";
import { toSafeUser } from "../users/user.presenter.js";
import { AUDIT_ACTIONS } from "./auth.constants.js";
import Counter from "./models/counter.model.js";
import OneTimeToken from "./models/one-time-token.model.js";
import Session from "./models/session.model.js";

const nextUserId = async () => {
  const counter = await Counter.findByIdAndUpdate(
    "user",
    { $inc: { sequence: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return `FPA-${String(counter.sequence).padStart(6, "0")}`;
};

const assertMongoId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid user id", { statusCode: 400, code: "INVALID_USER_ID" });
  }
};

const createOneTimeToken = async ({ userId, purpose, ttlMinutes, createdBy = null }) => {
  await OneTimeToken.updateMany({ userId, purpose, usedAt: null }, { $set: { usedAt: new Date() } });
  const raw = randomToken();
  await OneTimeToken.create({
    userId,
    purpose,
    tokenHash: hashOpaqueToken(raw),
    expiresAt: addMinutes(ttlMinutes),
    createdBy,
  });
  return raw;
};

const consumeOneTimeToken = async ({ rawToken, purpose }) => {
  const tokenHash = hashOpaqueToken(rawToken);
  const token = await OneTimeToken.findOne({
    tokenHash,
    purpose,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!token) {
    throw new AppError("This secure link is invalid or has expired", {
      statusCode: 400,
      code: "TOKEN_INVALID_OR_EXPIRED",
    });
  }

  return token;
};

const createSession = async ({ user, rememberMe, context }) => {
  const rawRefreshToken = randomToken(64);
  const days = rememberMe ? env.auth.rememberMeRefreshTokenTtlDays : env.auth.refreshTokenTtlDays;
  await Session.create({
    userId: user._id,
    tokenHash: hashOpaqueToken(rawRefreshToken),
    tokenVersion: user.tokenVersion,
    rememberMe,
    expiresAt: addDays(days),
    ip: context.ip || "",
    userAgent: context.userAgent || "",
    lastUsedAt: new Date(),
  });

  return {
    accessToken: signAccessToken(user),
    refreshToken: rawRefreshToken,
    rememberMe,
  };
};

const findUserByIdentifier = async (identifier) => {
  const raw = String(identifier || "").trim();
  let query;
  if (isEmailLike(raw)) query = { email: normalizeEmail(raw) };
  else if (isMobileLike(raw)) query = { mobile: normalizeMobile(raw) };
  else query = { userId: normalizeUserId(raw) };

  return User.findOne(query).select("+passwordHash +failedLoginAttempts +lockedUntil");
};

export const register = async (payload, context) => {
  const email = normalizeEmail(payload.email);
  const mobile = normalizeMobile(payload.mobile);

  const existing = await User.findOne({ $or: [{ email }, { mobile }] }).lean();
  if (existing) {
    throw new AppError("A registration already exists for this email or mobile number", {
      statusCode: 409,
      code: "REGISTRATION_EXISTS",
    });
  }

  const user = await User.create({
    userId: await nextUserId(),
    fullName: payload.fullName.trim(),
    email,
    mobile,
    designation: payload.designation.trim(),
    role: "TEAM_MEMBER",
    status: "PENDING",
  });

  await recordAudit({
    action: AUDIT_ACTIONS.REGISTER_REQUESTED,
    targetUserId: user._id,
    context,
    metadata: { userId: user.userId },
  });

  return toSafeUser(user);
};

export const login = async ({ identifier, password, rememberMe = false }, context) => {
  const user = await findUserByIdentifier(identifier);

  if (!user) {
    await verifyPassword(password, null);
    await recordAudit({ action: AUDIT_ACTIONS.LOGIN_FAILED, context, metadata: { reason: "unknown_identifier" } });
    throw new AppError("Invalid login credentials", { statusCode: 401, code: "LOGIN_FAILED" });
  }

  if (user.status !== "ACTIVE" || !user.passwordHash) {
    await recordAudit({ action: AUDIT_ACTIONS.LOGIN_FAILED, targetUserId: user._id, context, metadata: { reason: `status:${user.status}` } });
    throw new AppError("Your account is not active", { statusCode: 403, code: "ACCOUNT_NOT_ACTIVE" });
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AppError("Account temporarily locked after repeated failed sign-in attempts", {
      statusCode: 423,
      code: "ACCOUNT_LOCKED",
      details: { lockedUntil: user.lockedUntil },
    });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= env.auth.loginMaxFailures) {
      user.lockedUntil = addMinutes(env.auth.loginLockMinutes);
      user.failedLoginAttempts = 0;
      await recordAudit({ action: AUDIT_ACTIONS.ACCOUNT_LOCKED, targetUserId: user._id, context, metadata: { lockedUntil: user.lockedUntil } });
    }
    await user.save();
    await recordAudit({ action: AUDIT_ACTIONS.LOGIN_FAILED, targetUserId: user._id, context });
    throw new AppError("Invalid login credentials", { statusCode: 401, code: "LOGIN_FAILED" });
  }

  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  user.lastLoginAt = new Date();
  await user.save();

  const tokens = await createSession({ user, rememberMe, context });
  await recordAudit({ action: AUDIT_ACTIONS.LOGIN_SUCCESS, targetUserId: user._id, context });

  return { user: toSafeUser(user), ...tokens };
};

export const refresh = async (rawRefreshToken, context) => {
  if (!rawRefreshToken) {
    throw new AppError("Refresh session is unavailable", { statusCode: 401, code: "REFRESH_REQUIRED" });
  }

  const tokenHash = hashOpaqueToken(rawRefreshToken);
  const session = await Session.findOne({ tokenHash, revokedAt: null, expiresAt: { $gt: new Date() } });
  if (!session) {
    throw new AppError("Refresh session is invalid or expired", { statusCode: 401, code: "REFRESH_INVALID" });
  }

  const user = await User.findById(session.userId);
  if (!user || user.status !== "ACTIVE" || user.tokenVersion !== session.tokenVersion) {
    session.revokedAt = new Date();
    await session.save();
    throw new AppError("Refresh session is no longer valid", { statusCode: 401, code: "REFRESH_INVALID" });
  }

  const nextRefresh = randomToken(64);
  session.tokenHash = hashOpaqueToken(nextRefresh);
  session.lastUsedAt = new Date();
  session.ip = context.ip || session.ip;
  session.userAgent = context.userAgent || session.userAgent;
  await session.save();

  await recordAudit({ action: AUDIT_ACTIONS.TOKEN_REFRESHED, targetUserId: user._id, context });
  return {
    user: toSafeUser(user),
    accessToken: signAccessToken(user),
    refreshToken: nextRefresh,
    rememberMe: session.rememberMe,
  };
};

export const logout = async (rawRefreshToken, userId, context) => {
  if (rawRefreshToken) {
    await Session.updateOne({ tokenHash: hashOpaqueToken(rawRefreshToken), revokedAt: null }, { $set: { revokedAt: new Date() } });
  }
  await recordAudit({ action: AUDIT_ACTIONS.LOGOUT, actorUserId: userId || null, targetUserId: userId || null, context });
};

export const logoutAll = async (userId, context) => {
  await Session.updateMany({ userId, revokedAt: null }, { $set: { revokedAt: new Date() } });
  await recordAudit({ action: AUDIT_ACTIONS.LOGOUT_ALL, actorUserId: userId, targetUserId: userId, context });
};

export const activate = async ({ token, password }, context) => {
  const oneTimeToken = await consumeOneTimeToken({ rawToken: token, purpose: "ACTIVATION" });
  const user = await User.findById(oneTimeToken.userId).select("+passwordHash");
  if (!user || user.status !== "APPROVED") {
    throw new AppError("Account is not awaiting activation", { statusCode: 409, code: "ACCOUNT_NOT_ACTIVATABLE" });
  }

  user.passwordHash = await hashPassword(password);
  user.status = "ACTIVE";
  user.activatedAt = new Date();
  user.passwordChangedAt = new Date();
  user.tokenVersion += 1;
  await user.save();

  oneTimeToken.usedAt = new Date();
  await oneTimeToken.save();
  await Session.updateMany({ userId: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  await recordAudit({ action: AUDIT_ACTIONS.ACCOUNT_ACTIVATED, targetUserId: user._id, context });

  return toSafeUser(user);
};

export const forgotPassword = async ({ email }, context) => {
  const user = await User.findOne({ email: normalizeEmail(email), status: "ACTIVE" });
  if (user) {
    const token = await createOneTimeToken({
      userId: user._id,
      purpose: "PASSWORD_RESET",
      ttlMinutes: env.auth.passwordResetTokenTtlMinutes,
    });
    await sendPasswordResetEmail({ user, token });
    await recordAudit({ action: AUDIT_ACTIONS.PASSWORD_RESET_REQUESTED, targetUserId: user._id, context });
  }

  return { accepted: true };
};

export const resetPassword = async ({ token, password }, context) => {
  const oneTimeToken = await consumeOneTimeToken({ rawToken: token, purpose: "PASSWORD_RESET" });
  const user = await User.findById(oneTimeToken.userId).select("+passwordHash");
  if (!user || user.status !== "ACTIVE") {
    throw new AppError("Account is unavailable", { statusCode: 409, code: "ACCOUNT_UNAVAILABLE" });
  }

  user.passwordHash = await hashPassword(password);
  user.passwordChangedAt = new Date();
  user.tokenVersion += 1;
  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  await user.save();

  oneTimeToken.usedAt = new Date();
  await oneTimeToken.save();
  await Session.updateMany({ userId: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  await recordAudit({ action: AUDIT_ACTIONS.PASSWORD_RESET_COMPLETED, targetUserId: user._id, context });

  return { completed: true };
};

export const issueActivation = async ({ user, actorUserId, context }) => {
  const token = await createOneTimeToken({
    userId: user._id,
    purpose: "ACTIVATION",
    ttlMinutes: env.auth.activationTokenTtlMinutes,
    createdBy: actorUserId,
  });
  await sendActivationEmail({ user, token });
  await recordAudit({ action: AUDIT_ACTIONS.ACTIVATION_SENT, actorUserId, targetUserId: user._id, context });
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", { statusCode: 404, code: "USER_NOT_FOUND" });
  return toSafeUser(user);
};

export const assertUserId = assertMongoId;
