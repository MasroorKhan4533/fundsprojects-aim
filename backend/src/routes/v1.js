import { Router } from "express";

import authRoutes from "../features/auth/auth.routes.js";
import userRoutes from "../features/users/user.routes.js";
import leadRoutes from "../features/leads/lead.routes.js";
import c1Routes from "../features/c1/c1.routes.js";
import c2Routes from "../features/c2/c2.routes.js";
import c3Routes from "../features/c3/c3.routes.js";
import c4Routes from "../features/c4/c4.routes.js";
import documentRoutes from "../features/documents/document.routes.js";

/*
  Version 1 API router.
  All business APIs are mounted here.
*/

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FundsProjects AIM API is running",
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/leads", leadRoutes);

router.use("/c1", c1Routes);
router.use("/c2", c2Routes);
router.use("/c3", c3Routes);
router.use("/c4", c4Routes);

router.use(
  "/leads/:leadId/documents",
  documentRoutes
);

export default router;
