import { connectDatabase, disconnectDatabase } from "../../config/database.js";
import { env } from "../../config/env.js";
import { normalizeEmail, normalizeMobile } from "../../core/security/normalization.js";
import { hashPassword } from "../../core/security/password.js";
import Counter from "../../features/auth/models/counter.model.js";
import User from "../../features/users/user.model.js";
import { logger } from "../../utils/logger.js";

const run = async () => {
  await connectDatabase();
  const email = normalizeEmail(env.bootstrapAdmin.email);
  const existing = await User.findOne({ email }).select("+passwordHash");
  if (existing) {
    if (existing.role !== "ADMIN" || existing.status !== "ACTIVE") {
      throw new Error("Bootstrap admin email already belongs to a non-active-admin account. Resolve manually.");
    }
    logger.info({ email: existing.email }, "Bootstrap admin already exists");
    return;
  }

  const counter = await Counter.findByIdAndUpdate("user", { $inc: { sequence: 1 } }, { upsert: true, new: true });
  const user = await User.create({
    userId: `FPA-${String(counter.sequence).padStart(6, "0")}`,
    fullName: env.bootstrapAdmin.fullName,
    email,
    mobile: normalizeMobile(env.bootstrapAdmin.mobile),
    designation: env.bootstrapAdmin.designation,
    role: "ADMIN",
    status: "ACTIVE",
    passwordHash: await hashPassword(env.bootstrapAdmin.password),
    activatedAt: new Date(),
    approvedAt: new Date(),
    passwordChangedAt: new Date(),
  });
  logger.info({ userId: user.userId, email: user.email }, "Created bootstrap admin");
};

run()
  .then(disconnectDatabase)
  .catch(async (error) => {
    logger.error({ err: error }, "Bootstrap admin seed failed");
    await disconnectDatabase();
    process.exit(1);
  });
