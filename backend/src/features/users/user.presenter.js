export const toSafeUser = (user) => {
  const source = typeof user?.toObject === "function" ? user.toObject() : user;
  if (!source) return null;
  return {
    id: String(source._id),
    userId: source.userId,
    fullName: source.fullName,
    email: source.email,
    mobile: source.mobile,
    designation: source.designation,
    role: source.role,
    status: source.status,
    lastLoginAt: source.lastLoginAt || null,
    approvedAt: source.approvedAt || null,
    activatedAt: source.activatedAt || null,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
};
