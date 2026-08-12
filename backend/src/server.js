import app from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

let server;
let shuttingDown = false;

const shutdown = async (signal, exitCode = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info({ signal }, "Graceful shutdown started");

  const forceExit = setTimeout(() => {
    logger.error("Graceful shutdown timed out; forcing process exit");
    process.exit(1);
  }, env.shutdownTimeoutMs);
  forceExit.unref();

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }

    await disconnectDatabase();
    logger.info("Graceful shutdown completed");
    process.exit(exitCode);
  } catch (error) {
    logger.error({ err: error }, "Graceful shutdown failed");
    process.exit(1);
  }
};

const start = async () => {
  await connectDatabase();

  server = app.listen(env.port, () => {
    logger.info({ port: env.port }, `FundsProjects AIM API running on http://localhost:${env.port}`);
  });

  server.on("error", (error) => {
    logger.fatal({ err: error }, "HTTP server error");
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "Unhandled promise rejection");
  shutdown("unhandledRejection", 1);
});
process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught exception");
  shutdown("uncaughtException", 1);
});

start().catch((error) => {
  logger.fatal({ err: error }, "Application startup failed");
  process.exit(1);
});
