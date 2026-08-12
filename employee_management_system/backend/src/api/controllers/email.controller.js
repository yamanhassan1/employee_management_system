const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/apiError");
const ApiResponse = require("../../utils/apiResponse");
const { generateRandomToken, hashToken } = require("../../utils/generateToken");

const User = require("../../models/user.model");
const Token = require("../../models/token.model");
const { enqueueVerificationEmail } = require("../../queues/producers/email.producer");

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const tokenDoc = await Token.findOne({ tokenHash: hashToken(token), type: "emailVerification", used: false });
  if (!tokenDoc || tokenDoc.expiresAt < new Date()) throw new ApiError(400, "Verification link is invalid or has expired");

  const user = await User.findById(tokenDoc.user);
  if (!user) throw new ApiError(404, "User not found");

  user.isVerified = true;
  await user.save();
  tokenDoc.used = true;
  await tokenDoc.save();

  res.status(200).json(new ApiResponse(200, null, "Email verified successfully"));
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  const genericMsg = "If that email exists, a link has been sent.";
  if (!user) return res.status(200).json(new ApiResponse(200, null, genericMsg));
  if (user.isVerified) throw new ApiError(400, "Email is already verified");

  await Token.updateMany({ user: user._id, type: "emailVerification", used: false }, { used: true });

  const rawToken = generateRandomToken();
  await Token.create({
    user: user._id,
    tokenHash: hashToken(rawToken),
    type: "emailVerification",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  await enqueueVerificationEmail(user.email, rawToken);

  res.status(200).json(new ApiResponse(200, null, genericMsg));
});

module.exports = { verifyEmail, resendVerificationEmail };