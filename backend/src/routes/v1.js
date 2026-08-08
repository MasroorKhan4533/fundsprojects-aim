import { Router } from "express";
import authRoutes from "../features/auth/auth.routes.js";
import dashboardRoutes from "../features/dashboard/dashboard.routes.js";
import targetRoutes from "../features/targets/target.routes.js";
import userRoutes from "../features/users/user.routes.js";
import healthRoutes from "./health.routes.js";

const router = Router();
router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/targets", targetRoutes);
router.use("/dashboard", dashboardRoutes);
export default router;
