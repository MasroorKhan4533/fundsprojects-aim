import { Sequelize } from "sequelize";
import { env } from "./env.js";

export const sequelize = new Sequelize(
  env.database.name,
  env.database.user,
  env.database.password,
  {
    host: env.database.host,
    port: env.database.port,
    dialect: "postgres",
    logging: env.nodeEnv === "development" ? console.log : false,
  }
);

export const connectDatabase = async () => {
  await sequelize.authenticate();
  console.log("PostgreSQL connected successfully");
};
