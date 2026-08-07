import app from "./app.js";

import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { initializeAssociations } from "./config/associations.js";

const startServer = async () => {
  try {
    initializeAssociations();

    await connectDatabase();

    const server = app.listen(
      env.port,
      () => {
        console.log(
          `FundsProjects AIM API running on http://localhost:${env.port}`
        );
      }
    );

    server.on("error", (error) => {
      console.error(
        "Server error:",
        error
      );
    });
  } catch (error) {
    console.error(
      "Database connection failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();
