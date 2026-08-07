import { Router } from "express";

import authRoutes from "../features/auth/auth.routes.js";
import userRoutes from "../features/users/user.routes.js";
import leadRoutes from "../features/leads/lead.routes.js";
import c1Routes from "../features/c1/c1.routes.js";
import documentRoutes from "../features/documents/document.routes.js";

const router = Router();

router.get(
  "/health",
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        "FundsProjects AIM API is running",
    });
  }
);

router.use(
  "/auth",
  authRoutes
);

router.use(
  "/users",
  userRoutes
);

router.use(
  "/leads",
  leadRoutes
);

router.use(
  "/c1",
  c1Routes
);

router.use(
  "/leads/:leadId/documents",
  documentRoutes
);

export default router;
