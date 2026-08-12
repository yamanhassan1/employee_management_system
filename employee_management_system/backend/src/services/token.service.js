const {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
} = require("../utils/generateToken");
const { REFRESH_TOKEN_EXPIRY_MS } = require("../config/env");
const RefreshToken = require("../models/refreshToken.model");

const generateAccessToken = (user) =>
  signAccessToken({ id: user._id, role: user.role });

const generateRefreshToken = (user, sessionId) =>
  signRefreshToken({ id: user._id, sessionId });

const storeRefreshToken = async ({ userId, sessionId, rawToken }) => {
  const tokenHash = hashToken(rawToken);
  return RefreshToken.create({
    user: userId,
    session: sessionId,
    tokenHash,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
  });
};

// First login on a session: issue + persist a token pair
const issueTokenPair = async (user, sessionId) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, sessionId);
  await storeRefreshToken({ userId: user._id, sessionId, rawToken: refreshToken });
  return { accessToken, refreshToken };
};

// Rotation: revoke old DB record, link it to the new one, issue fresh pair
const rotateRefreshToken = async (oldTokenDoc, user, sessionId) => {
  const newRawToken = generateRefreshToken(user, sessionId);
  const newTokenHash = hashToken(newRawToken);

  oldTokenDoc.isRevoked = true;
  oldTokenDoc.replacedByTokenHash = newTokenHash;
  await oldTokenDoc.save();

  await RefreshToken.create({
    user: user._id,
    session: sessionId,
    tokenHash: newTokenHash,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
  });

  const accessToken = generateAccessToken(user);
  return { accessToken, refreshToken: newRawToken };
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
  issueTokenPair,
  rotateRefreshToken,
};