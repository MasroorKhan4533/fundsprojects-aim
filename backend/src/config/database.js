import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

mongoose.set("strictQuery", true);
mongoose.set("sanitizeFilter", true);

export const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  mongoose.connection.on("connected", () => {
    logger.info({ database: mongoose.connection.name }, "MongoDB connected");
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });

  mongoose.connection.on("error", (error) => {
    logger.error({ err: error }, "MongoDB connection error");
  });

  await mongoose.connect(env.mongo.uri, {
    maxPoolSize: env.mongo.maxPoolSize,
    minPoolSize: env.mongo.minPoolSize,
    serverSelectionTimeoutMS: env.mongo.serverSelectionTimeoutMS,
    autoIndex: !env.isProduction,
  });

  return mongoose.connection;
};

export const disconnectDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

export const getDatabaseHealth = () => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return {
    ready: mongoose.connection.readyState === 1,
    state: states[mongoose.connection.readyState] ?? "unknown",
    database: mongoose.connection.name || null,
  };
};
