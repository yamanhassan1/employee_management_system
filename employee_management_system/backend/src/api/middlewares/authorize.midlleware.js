const ApiError = require("../../utils/apiError");

// authorize("admin", "manager")
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  if (!roles.includes(req.user.role)) throw new ApiError(403, "Permission denied");
  next();
};

module.exports = authorize;