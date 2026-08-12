const { NODE_ENV, REFRESH_TOKEN_EXPIRY_MS } = require("./env");

const base = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: NODE_ENV === "production" ? "none" : "lax",
};

const accessTokenCookieOptions = { ...base, maxAge: 15 * 60 * 1000 };
const refreshTokenCookieOptions = { ...base, maxAge: REFRESH_TOKEN_EXPIRY_MS, path: "/api/v1/auth" };

module.exports = { accessTokenCookieOptions, refreshTokenCookieOptions };