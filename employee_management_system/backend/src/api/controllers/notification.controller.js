const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const notificationService = require("../../services/notification.service");

const listNotifications = asyncHandler(async (req, res) => {
  const data = await notificationService.listNotifications(req.user._id, req.query);
  res.status(200).json(new ApiResponse(200, data, "Notifications fetched"));
});

const markRead = asyncHandler(async (req, res) => {
  const data = await notificationService.markNotificationRead(req.user._id, req.params.id);
  res.status(200).json(new ApiResponse(200, data, "Notification marked as read"));
});

const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllNotificationsRead(req.user._id);
  res.status(200).json(new ApiResponse(200, null, "All notifications marked as read"));
});

module.exports = { listNotifications, markRead, markAllRead };
