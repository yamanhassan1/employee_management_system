const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/apiError");
const { verifyAccessToken } = require("../../services/token.service");
const User = require("../../models/user.model");

const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) throw new ApiError(401, "Not authenticated");

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw new ApiError(401, "Invalid or expired access token");
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, "User no longer exists");

  req.user = user;
  next();
});

module.exports = authenticate;