import { env } from "../../config/env.js";

const baseCookie = () => ({
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "strict",
  path: "/",
});

export const setAccessCookie = (res, token) => {
  res.cookie(env.auth.accessCookieName, token, {
    ...baseCookie(),
    maxAge: env.auth.accessTokenTtlMinutes * 60_000,
  });
};

export const setRefreshCookie = (res, token, rememberMe = false) => {
  const days = rememberMe
    ? env.auth.rememberMeRefreshTokenTtlDays
    : env.auth.refreshTokenTtlDays;

  res.cookie(env.auth.refreshCookieName, token, {
    ...baseCookie(),
    maxAge: days * 86_400_000,
  });
};

export const clearAuthCookies = (res) => {
  res.clearCookie(env.auth.accessCookieName, baseCookie());
  res.clearCookie(env.auth.refreshCookieName, baseCookie());
};
