import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFound } from "./middlewares/not-found.js";
import { requestId } from "./middlewares/request-id.js";
import { requestLogger } from "./middlewares/request-logger.js";
import v1Routes from "./routes/v1.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", env.isProduction ? 1 : false);

app.use(requestId);
app.use(requestLogger);
app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    exposedHeaders: ["X-Request-Id"],
  })
);
app.use(compression());
app.use(
  rateLimit({
    windowMs: env.rateLimit.windowMs,
    limit: env.rateLimit.max,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: (req) => req.path === "/api/v1/health/live",
  })
);
app.use(express.json({ limit: env.requestBodyLimit }));
app.use(express.urlencoded({ extended: false, limit: env.requestBodyLimit }));
app.use(cookieParser());

app.use("/api/v1", v1Routes);

app.use(notFound);
app.use(errorHandler);

export default app;
