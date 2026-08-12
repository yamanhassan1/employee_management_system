const Session = require("../models/session.model");
const RefreshToken = require("../models/refreshToken.model");

const createSession = async ({ userId, deviceId, userAgent, ip }) =>
  Session.create({ user: userId, deviceId, userAgent, ip });

const touchSession = async (sessionId) => {
  await Session.findByIdAndUpdate(sessionId, { lastActiveAt: new Date() });
};

const getActiveSessions = async (userId) =>
  Session.find({ user: userId, isRevoked: false }).sort({ lastActiveAt: -1 });

// Revoke one session + cascade to its refresh tokens
const revokeSession = async (sessionId, userId) => {
  const session = await Session.findOne({ _id: sessionId, user: userId });
  if (!session) return null;

  session.isRevoked = true;
  await session.save();

  await RefreshToken.updateMany(
    { session: sessionId, isRevoked: false },
    { isRevoked: true }
  );

  return session;
};

// Used on password reset / theft detection
const revokeAllSessions = async (userId, exceptSessionId = null) => {
  const filter = { user: userId, isRevoked: false };
  if (exceptSessionId) filter._id = { $ne: exceptSessionId };

  const sessions = await Session.find(filter);
  const sessionIds = sessions.map((s) => s._id);

  await Session.updateMany(filter, { isRevoked: true });
  await RefreshToken.updateMany(
    { session: { $in: sessionIds }, isRevoked: false },
    { isRevoked: true }
  );
};

module.exports = { createSession, touchSession, getActiveSessions, revokeSession, revokeAllSessions };