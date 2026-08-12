const mongoose = require("mongoose");

// Generic single-use token model for email verification & password reset
const tokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String, // hash of the raw token sent via email
      required: true,
    },
    type: {
      type: String,
      enum: ["emailVerification", "passwordReset"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
tokenSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model("Token", tokenSchema);