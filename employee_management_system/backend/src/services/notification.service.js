const mongoose = require("mongoose");
const notificationRepo = require("../repositories/notification.repository");
const { emitToUser } = require("../sockets");
const ApiError = require("../utils/apiError");

const listNotifications = async (userId, query) => {
  const [items, total, unreadCount] = await notificationRepo.listByUser({ userId, ...query });
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  return { items, total, unreadCount, page, limit, totalPages: Math.ceil(total / limit) };
};

const markNotificationRead = async (userId, notificationId) => {
  if (!mongoose.isValidObjectId(notificationId)) throw new ApiError(400, "Invalid notification id");
  const updated = await notificationRepo.markRead(notificationId, userId);
  if (!updated) throw new ApiError(404, "Notification not found");
  return updated;
};

const markAllNotificationsRead = async (userId) => {
  await notificationRepo.markAllRead(userId);
  return { success: true };
};

const createNotification = async ({ userId, type, title, message }) => {
  const notification = await notificationRepo.create({ user: userId, type, title, message });
  emitToUser(userId, "notification:new", notification);
  return notification;
};

module.exports = { listNotifications, markNotificationRead, markAllNotificationsRead, createNotification };
