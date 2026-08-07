import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../features/users/user.model.js";

export const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.[env.auth.cookieName];

    const authorization = req.headers.authorization;

    if (!token && authorization?.startsWith("Bearer ")) {
      token = authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const payload = jwt.verify(token, env.auth.jwtSecret);

    const user = await User.findByPk(payload.sub);

    if (!user || user.status !== "ACTIVE") {
      return res.status(401).json({
        success: false,
        message: "User account is unavailable",
      });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication",
    });
  }
};
