import app from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.port, () => {
  console.log(`FundsProjects AIM API running on http://localhost:${env.port}`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
});
