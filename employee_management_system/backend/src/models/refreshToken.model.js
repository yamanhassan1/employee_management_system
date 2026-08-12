const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String, // SHA-256 hash of the raw refresh token, never store raw
      required: true,
      unique: true,
    },
    // Rotation chain: lets you detect reuse of an old/revoked token
    replacedByTokenHash: {
      type: String,
      default: null,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-delete expired docs (TTL index)
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);