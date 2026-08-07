import "dotenv/config";

export const env = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  database: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    name: process.env.DB_NAME || "fundsprojects_aim",
    user: process.env.DB_USER || "fundsroom",
    password: process.env.DB_PASSWORD || "",
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
    cookieName: process.env.COOKIE_NAME || "aim_token",
  },
};
