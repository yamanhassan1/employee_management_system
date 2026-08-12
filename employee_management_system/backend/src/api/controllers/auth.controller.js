const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/apiError");
const ApiResponse = require("../../utils/apiResponse");
const lockoutService = require("../../services/lockout.service");
const { generateRandomToken, hashToken } = require("../../utils/generateToken");

const User = require("../../models/user.model");
const Token = require("../../models/token.model");
const RefreshToken = require("../../models/refreshToken.model");

const tokenService = require("../../services/token.service");
const sessionService = require("../../services/session.service");
const { enqueueVerificationEmail } = require("../../queues/producers/email.producer");

const { accessTokenCookieOptions, refreshTokenCookieOptions } = require("../../config/cookiesOptions");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Duplicate email check (race-safe via unique index, but check first for friendly error)
  if (await User.findOne({ email })) throw new ApiError(409, "Email is already registered");

  // Public self-registration always creates an 'employee'. Promotions are done by an admin.
  const user = await User.create({ name, email, password, role: "employee" });

  const rawToken = generateRandomToken();
  await Token.create({
    user: user._id,
    tokenHash: hashToken(rawToken),
    type: "emailVerification",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  await enqueueVerificationEmail(user.email, rawToken);

  res.status(201).json(new ApiResponse(201, { id: user._id, email: user.email }, "Registered. Please verify your email."));
});

const login = asyncHandler(async (req, res) => {
  const { email, password, deviceId } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError(401, "Invalid email or password");

  if (lockoutService.isAccountLocked(user)) {
    const minutesLeft = lockoutService.getRemainingLockTime(user);
    throw new ApiError(423, `Account locked. Try again in ${minutesLeft} minute(s).`);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await lockoutService.handleFailedLogin(user);
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isVerified) throw new ApiError(403, "Please verify your email before logging in");

  await lockoutService.handleSuccessfulLogin(user);

  const session = await sessionService.createSession({
    userId: user._id,
    deviceId: deviceId || `default-${user._id}`,
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  });

  const { accessToken, refreshToken } = await tokenService.issueTokenPair(user, session._id);

  res
    .cookie("accessToken", accessToken, accessTokenCookieOptions)
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
    .status(200)
    .json(new ApiResponse(200, { id: user._id, name: user.name, email: user.email, role: user.role }, "Login successful"));
});

const refresh = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.refreshToken;
  if (!incomingToken) throw new ApiError(401, "Refresh token missing");

  let decoded;
  try {
    decoded = tokenService.verifyRefreshToken(incomingToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const tokenDoc = await RefreshToken.findOne({ tokenHash: hashToken(incomingToken) });

  // Reuse/theft detection: missing or already-rotated token replayed
  if (!tokenDoc || tokenDoc.isRevoked) {
    await sessionService.revokeAllSessions(decoded.id);
    throw new ApiError(401, "Refresh token reuse detected. All sessions revoked.");
  }
  if (tokenDoc.expiresAt < new Date()) throw new ApiError(401, "Refresh token expired, please log in again");

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, "User no longer exists");

  const { accessToken, refreshToken } = await tokenService.rotateRefreshToken(tokenDoc, user, decoded.sessionId);
  await sessionService.touchSession(decoded.sessionId);

  res
    .cookie("accessToken", accessToken, accessTokenCookieOptions)
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
    .status(200)
    .json(new ApiResponse(200, null, "Token refreshed"));
});

const logout = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.refreshToken;
  if (incomingToken) {
    const tokenDoc = await RefreshToken.findOne({ tokenHash: hashToken(incomingToken) });
    if (tokenDoc) await sessionService.revokeSession(tokenDoc.session, tokenDoc.user);
  }

  res
    .clearCookie("accessToken", accessTokenCookieOptions)
    .clearCookie("refreshToken", refreshTokenCookieOptions)
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

const logoutAllDevices = asyncHandler(async (req, res) => {
  await sessionService.revokeAllSessions(req.user._id);
  res
    .clearCookie("accessToken", accessTokenCookieOptions)
    .clearCookie("refreshToken", refreshTokenCookieOptions)
    .status(200)
    .json(new ApiResponse(200, null, "Logged out from all devices"));
});

// GET /auth/me — returns the authenticated user with populated role relationships
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("reportsTo", "name email role")
    .populate("department", "name");
  res.status(200).json(new ApiResponse(200, user, "Current user fetched"));
});

// PATCH /auth/me — authenticated user updates their own profile (name, email, jobTitle, password)
const updateMyProfile = asyncHandler(async (req, res) => {
  const { name, email, jobTitle, currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");
  if (!user) throw new ApiError(404, "User not found");

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) throw new ApiError(422, "Name cannot be empty");
    user.name = name.trim();
  }

  if (jobTitle !== undefined) {
    if (typeof jobTitle !== "string") throw new ApiError(422, "Invalid job title");
    user.jobTitle = jobTitle.trim();
  }

  if (email !== undefined) {
    if (typeof email !== "string" || !email.trim()) throw new ApiError(422, "Invalid email");
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== user.email) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) throw new ApiError(409, "Email is already in use");
      user.email = normalizedEmail;
      // Changing email invalidates verification status until re-verified
      user.isVerified = false;
    }
  }

  if (newPassword !== undefined && newPassword !== null && newPassword !== "") {
    if (!currentPassword) throw new ApiError(400, "Current password is required to change password");
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new ApiError(401, "Current password is incorrect");
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      throw new ApiError(422, "New password must be at least 6 characters");
    }
    user.password = newPassword;
    // Revoke other sessions after a password change for security
    await sessionService.revokeAllSessions(user._id);
  }

  await user.save();

  const populated = await User.findById(user._id)
    .populate("reportsTo", "name email role")
    .populate("department", "name");

  res.status(200).json(new ApiResponse(200, populated, "Profile updated"));
});

module.exports = { register, login, refresh, logout, logoutAllDevices, getCurrentUser, updateMyProfile };
