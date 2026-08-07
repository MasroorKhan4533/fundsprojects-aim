import { env } from "../../config/env.js";
import { loginUser } from "./auth.service.js";

export const login = async (req, res) => {
  const { email, password } = req.validated.body;

  const result = await loginUser(email, password);

  res.cookie(env.auth.cookieName, result.token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 8 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    user: result.user,
  });
};

export const me = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user.toSafeJSON(),
  });
};

export const logout = async (req, res) => {
  res.clearCookie(env.auth.cookieName);

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};
