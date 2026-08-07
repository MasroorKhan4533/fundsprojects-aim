import path from "path";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import v1Routes from "./routes/v1.js";

import { requestId } from "./middlewares/request-id.js";
import { notFound } from "./middlewares/not-found.js";
import { errorHandler } from "./middlewares/error-handler.js";

const app = express();

app.use(requestId);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy:
        "cross-origin",
    },
  })
);

app.use(
  cors({
    origin:
      env.frontendUrl,
    credentials: true,
  })
);

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  cookieParser()
);

app.use(
  morgan("dev")
);

app.use(
  "/uploads",
  express.static(
    path.resolve("uploads")
  )
);

app.use(
  "/api/v1",
  v1Routes
);

app.use(notFound);
app.use(errorHandler);

export default app;
