import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { AppError } from "../errors/app-error.js";

const JWT_ISSUER = "fundsprojects-aim-api";
const JWT_AUDIENCE = "fundsprojects-aim-web";

export const randomToken = (bytes = 48) => crypto.randomBytes(bytes).toString("base64url");
export const hashOpaqueToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const addMinutes = (minutes) => new Date(Date.now() + minutes * 60_000);
export const addDays = (days) => new Date(Date.now() + days * 86_400_000);

export const signAccessToken = (user) => jwt.sign(
  {
    uid: user.userId,
    role: user.role,
    ver: user.tokenVersion,
  },
  env.auth.jwtSecret,
  {
    subject: String(user._id),
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn: `${env.auth.accessTokenTtlMinutes}m`,
    algorithm: "HS256",
  }
);

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.auth.jwtSecret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ["HS256"],
    });
  } catch (error) {
    throw new AppError("Invalid or expired authentication", {
      statusCode: 401,
      code: "AUTH_INVALID",
      cause: error,
    });
  }
};
