import { Router } from "express";
import { getDatabaseHealth } from "../config/database.js";
import { sendSuccess } from "../core/http/response.js";

const router = Router();
const startedAt = Date.now();

router.get("/live", (_req, res) => {
  sendSuccess(res, {
    data: {
      service: "fundsprojects-aim-api",
      status: "alive",
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    },
    message: "API is alive",
  });
});

router.get("/ready", (_req, res) => {
  const database = getDatabaseHealth();
  const ready = database.ready;

  return res.status(ready ? 200 : 503).json({
    success: ready,
    message: ready ? "API is ready" : "API is not ready",
    data: {
      service: "fundsprojects-aim-api",
      status: ready ? "ready" : "degraded",
      database,
    },
    requestId: res.locals.requestId,
  });
});

router.get("/", (_req, res) => {
  const database = getDatabaseHealth();
  return res.status(database.ready ? 200 : 503).json({
    success: database.ready,
    message: database.ready ? "FundsProjects AIM API is running" : "FundsProjects AIM API is starting",
    data: { database },
    requestId: res.locals.requestId,
  });
});

export default router;
