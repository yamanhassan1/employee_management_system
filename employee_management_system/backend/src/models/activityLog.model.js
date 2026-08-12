const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      enum: ["task", "project", "user", "department", "auth", "misc"],
      default: "misc",
    },
    details: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
