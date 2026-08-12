const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    deviceId: {
      type: String, // client-generated fingerprint/UUID, sent from frontend
      required: true,
    },
    userAgent: {
      type: String,
      default: "",
    },
    ip: {
      type: String,
      default: "",
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

sessionSchema.index({ user: 1, isRevoked: 1 });

module.exports = mongoose.model("Session", sessionSchema);