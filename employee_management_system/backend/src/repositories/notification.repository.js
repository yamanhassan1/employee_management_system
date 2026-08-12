const Notification = require("../models/notification.model");

const listByUser = ({ userId, read, page = 1, limit = 20 }) => {
  const filter = { user: userId };
  if (read !== undefined) filter.isRead = read === "true" || read === true;

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (safePage - 1) * safeLimit;

  return Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);
};

const markRead = (id, userId) =>
  Notification.findOneAndUpdate({ _id: id, user: userId }, { isRead: true }, { new: true }).lean();

const markAllRead = (userId) => Notification.updateMany({ user: userId, isRead: false }, { isRead: true });

const create = (data) => Notification.create(data);

module.exports = { listByUser, markRead, markAllRead, create };
