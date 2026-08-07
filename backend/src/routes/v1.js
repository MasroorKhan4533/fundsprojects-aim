import { Router } from "express";

import authRoutes from "../features/auth/auth.routes.js";
import userRoutes from "../features/users/user.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FundsProjects AIM API is running",
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

export default router;
