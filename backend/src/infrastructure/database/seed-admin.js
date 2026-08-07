import "dotenv/config";
import bcrypt from "bcryptjs";

import { sequelize } from "../../config/database.js";
import User from "../../features/users/user.model.js";

const run = async () => {
  try {
    await sequelize.authenticate();

    const email = process.env.SEED_ADMIN_EMAIL.toLowerCase();
    const passwordHash = await bcrypt.hash(
      process.env.SEED_ADMIN_PASSWORD,
      12
    );

    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        fullName: process.env.SEED_ADMIN_NAME,
        email,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    if (!created) {
      user.fullName = process.env.SEED_ADMIN_NAME;
      user.passwordHash = passwordHash;
      user.role = "ADMIN";
      user.status = "ACTIVE";
      await user.save();
    }

    console.log(
      created
        ? "Admin user created successfully"
        : "Admin password reset successfully"
    );

    await sequelize.close();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
