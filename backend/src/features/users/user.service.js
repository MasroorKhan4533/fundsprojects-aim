import bcrypt from "bcryptjs";
import User from "./user.model.js";

export const createUser = async ({
  fullName,
  email,
  password,
  role,
}) => {
  const normalizedEmail = email.toLowerCase();

  const existingUser = await User.findOne({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    const error = new Error("User with this email already exists");
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    fullName,
    email: normalizedEmail,
    passwordHash,
    role,
  });

  return user.toSafeJSON();
};

export const listUsers = async () => {
  const users = await User.findAll({
    order: [["createdAt", "ASC"]],
  });

  return users.map((user) => user.toSafeJSON());
};

export const changeUserStatus = async (id, status) => {
  const user = await User.findByPk(id);

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  user.status = status;
  await user.save();

  return user.toSafeJSON();
};

export const changeUserRole = async (id, role) => {
  const user = await User.findByPk(id);

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  user.role = role;
  await user.save();

  return user.toSafeJSON();
};

export const resetUserPassword = async (id, password) => {
  const user = await User.findByPk(id);

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  user.passwordHash = await bcrypt.hash(password, 12);
  await user.save();

  return true;
};
