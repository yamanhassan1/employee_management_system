const logger = require("../utils/logger");

const setupNotificationsNamespace = (io) => {
  io.of("/notifications").on("connection", (socket) => {
    const userId = socket.data.user.id;
    socket.join(`user:${userId}`);
    logger.debug("Notification socket connected", { userId });
  });
};

module.exports = setupNotificationsNamespace;
