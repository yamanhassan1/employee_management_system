require("dotenv").config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  MONGO_URI: process.env.MONGO_URI,
  REDIS_URL: process.env.REDIS_URL || "redis://127.0.0.1:6379",

  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "dev_access_secret_change_me",
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || "15m",

  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "dev_refresh_secret_change_me",
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  REFRESH_TOKEN_EXPIRY_MS: Number(process.env.REFRESH_TOKEN_EXPIRY_MS) || 7 * 24 * 60 * 60 * 1000,

  MAX_LOGIN_ATTEMPTS: Number(process.env.MAX_LOGIN_ATTEMPTS) || 5,
  LOCK_MINUTES: Number(process.env.LOCK_MINUTES) || 15,

  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
EMAIL_FROM: process.env.EMAIL_FROM || "yamanhassan47@gmail.com",
};
