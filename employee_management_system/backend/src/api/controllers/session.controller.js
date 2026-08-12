const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/apiError");
const ApiResponse = require("../../utils/apiResponse");
const sessionService = require("../../services/session.service");

const getSessions = asyncHandler(async (req, res) => {
  const sessions = await sessionService.getActiveSessions(req.user._id);
  res.status(200).json(new ApiResponse(200, sessions, "Active sessions fetched"));
});

const revokeSession = asyncHandler(async (req, res) => {
  const session = await sessionService.revokeSession(req.params.sessionId, req.user._id);
  if (!session) throw new ApiError(404, "Session not found");
  res.status(200).json(new ApiResponse(200, null, "Session revoked"));
});

module.exports = { getSessions, revokeSession };