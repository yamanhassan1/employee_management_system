const { getNotificationQueue } = require("../index");

const enqueueNotification = async (userId, type, title, message) => {
  const queue = getNotificationQueue();
  await queue.add("send-notification", { userId, type, title, message }, { attempts: 3, backoff: { type: "exponential", delay: 5000 } });
};

module.exports = { enqueueNotification };
