import {
  changeUserRole,
  changeUserStatus,
  createUser,
  listUsers,
  resetUserPassword,
} from "./user.service.js";

export const create = async (req, res) => {
  const user = await createUser(req.validated.body);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    user,
  });
};

export const list = async (req, res) => {
  const users = await listUsers();

  res.status(200).json({
    success: true,
    users,
  });
};

export const updateStatus = async (req, res) => {
  const user = await changeUserStatus(
    req.validated.params.id,
    req.validated.body.status
  );

  res.status(200).json({
    success: true,
    message: "User status updated",
    user,
  });
};

export const updateRole = async (req, res) => {
  const user = await changeUserRole(
    req.validated.params.id,
    req.validated.body.role
  );

  res.status(200).json({
    success: true,
    message: "User role updated",
    user,
  });
};

export const resetPassword = async (req, res) => {
  await resetUserPassword(
    req.validated.params.id,
    req.validated.body.password
  );

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
};
