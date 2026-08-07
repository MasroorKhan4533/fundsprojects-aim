import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../users/user.model.js";
import { env } from "../../config/env.js";

export const loginUser = async (email, password) => {
  const user = await User.findOne({
    where: {
      email: email.toLowerCase(),
    },
  });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  if (user.status !== "ACTIVE") {
    const error = new Error("User account is disabled");
    error.status = 403;
    throw error;
  }

  const validPassword = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!validPassword) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    env.auth.jwtSecret,
    {
      expiresIn: env.auth.jwtExpiresIn,
    }
  );

  return {
    token,
    user: user.toSafeJSON(),
  };
};
