const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY,
} = require("../config/env");

// ---- JWT (access / refresh) ----
const signAccessToken = (payload) =>
  jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

const signRefreshToken = (payload) =>
  jwt.sign({ ...payload, jti: crypto.randomUUID() }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

const verifyAccessToken = (token) => jwt.verify(token, ACCESS_TOKEN_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_TOKEN_SECRET);

// ---- Raw random tokens (email verification / password reset) ----
const generateRandomToken = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");
const hashToken = (rawToken) => crypto.createHash("sha256").update(rawToken).digest("hex");

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateRandomToken,
  hashToken,
};