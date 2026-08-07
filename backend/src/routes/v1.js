import { Router } from "express";

const router = Router();

// Basic API health check used to confirm that the backend is running.
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FundsProjects AIM API is running",
  });
});

export default router;
