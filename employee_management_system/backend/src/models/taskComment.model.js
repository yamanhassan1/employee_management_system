const mongoose = require("mongoose");

const taskCommentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    // Relations
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

taskCommentSchema.index({ task: 1, createdAt: -1 });

module.exports = mongoose.model("TaskComment", taskCommentSchema);
