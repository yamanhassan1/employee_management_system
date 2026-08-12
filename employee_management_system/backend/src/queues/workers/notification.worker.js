const notificationRepo = require("../../repositories/notification.repository");
const { emitToUser } = require("../../sockets");

const processNotificationJob = async (job) => {
  const { userId, type, title, message } = job.data;
  const notification = await notificationRepo.create({ user: userId, type, title, message });
  emitToUser(userId, "notification:new", notification);
};

module.exports = processNotificationJob;
