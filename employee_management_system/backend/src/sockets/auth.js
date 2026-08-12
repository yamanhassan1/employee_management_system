const { verifyAccessToken } = require("../services/token.service");
const logger = require("../utils/logger");

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace("Bearer ", "");
    if (!token) return next(new Error("Authentication required"));
    const decoded = verifyAccessToken(token);
    socket.data.user = { id: decoded.sub || decoded._id, role: decoded.role };
    next();
  } catch {
    next(new Error("Invalid token"));
  }
};

module.exports = socketAuth;
