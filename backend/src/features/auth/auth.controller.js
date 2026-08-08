import { env } from "../../config/env.js";
import { sendSuccess } from "../../core/http/response.js";
import { clearAuthCookies, setAccessCookie, setRefreshCookie } from "../../core/security/cookies.js";
import { getCurrentUser, activate, forgotPassword, login, logout, logoutAll, refresh, register, resetPassword } from "./auth.service.js";

const contextFrom = (req) => ({
  requestId: req.requestId,
  ip: req.ip,
  userAgent: req.get("user-agent") || "",
});

export const registerController = async (req, res) => {
  const user = await register(req.validated.body, contextFrom(req));
  return sendSuccess(res, {
    statusCode: 201,
    message: "Registration submitted for administrator approval",
    data: { user },
  });
};

export const loginController = async (req, res) => {
  const result = await login(req.validated.body, contextFrom(req));
  setAccessCookie(res, result.accessToken);
  setRefreshCookie(res, result.refreshToken, result.rememberMe);
  return sendSuccess(res, { message: "Login successful", data: { user: result.user } });
};

export const refreshController = async (req, res) => {
  const result = await refresh(req.cookies?.[env.auth.refreshCookieName], contextFrom(req));
  setAccessCookie(res, result.accessToken);
  setRefreshCookie(res, result.refreshToken, result.rememberMe);
  return sendSuccess(res, { message: "Session refreshed", data: { user: result.user } });
};

export const logoutController = async (req, res) => {
  await logout(req.cookies?.[env.auth.refreshCookieName], req.user?._id, contextFrom(req));
  clearAuthCookies(res);
  return sendSuccess(res, { message: "Logged out" });
};

export const logoutAllController = async (req, res) => {
  await logoutAll(req.user._id, contextFrom(req));
  clearAuthCookies(res);
  return sendSuccess(res, { message: "Logged out from all sessions" });
};

export const activateController = async (req, res) => {
  const user = await activate(req.validated.body, contextFrom(req));
  clearAuthCookies(res);
  return sendSuccess(res, { message: "Account activated. You can now sign in.", data: { user } });
};

export const forgotPasswordController = async (req, res) => {
  await forgotPassword(req.validated.body, contextFrom(req));
  return sendSuccess(res, { message: "If the account exists, a password reset email has been sent." });
};

export const resetPasswordController = async (req, res) => {
  await resetPassword(req.validated.body, contextFrom(req));
  clearAuthCookies(res);
  return sendSuccess(res, { message: "Password reset completed. Please sign in again." });
};

export const meController = async (req, res) => {
  const user = await getCurrentUser(req.user._id);
  return sendSuccess(res, { data: { user } });
};
