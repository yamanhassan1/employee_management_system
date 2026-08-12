const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/apiError");
const ApiResponse = require("../../utils/apiResponse");
const { generateRandomToken, hashToken } = require("../../utils/generateToken");

const User = require("../../models/user.model");
const Token = require("../../models/token.model");
const { enqueuePasswordResetEmail } = require("../../queues/producers/email.producer");
const sessionService = require("../../services/session.service");

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always 200 — don't leak which emails are registered
  const genericMsg = "If that email is registered, a reset link has been sent.";
  if (!user) return res.status(200).json(new ApiResponse(200, null, genericMsg));

  await Token.updateMany({ user: user._id, type: "passwordReset", used: false }, { used: true });

  const rawToken = generateRandomToken();
  await Token.create({
    user: user._id,
    tokenHash: hashToken(rawToken),
    type: "passwordReset",
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
  await enqueuePasswordResetEmail(user.email, rawToken);

  res.status(200).json(new ApiResponse(200, null, genericMsg));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const tokenDoc = await Token.findOne({ tokenHash: hashToken(token), type: "passwordReset", used: false });
  if (!tokenDoc || tokenDoc.expiresAt < new Date()) throw new ApiError(400, "Reset link is invalid or has expired");

  const user = await User.findById(tokenDoc.user);
  if (!user) throw new ApiError(404, "User not found");

  user.password = newPassword; // re-hashed by pre-save hook
  await user.resetLoginAttempts();
  await user.save();

  tokenDoc.used = true;
  await tokenDoc.save();

  await sessionService.revokeAllSessions(user._id); // kill all sessions on password change

  res.status(200).json(new ApiResponse(200, null, "Password reset successful. Please log in again."));
});

module.exports = { forgotPassword, resetPassword };