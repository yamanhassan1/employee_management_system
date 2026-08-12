const mongoose = require("mongoose");

const taskListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Position within the project board (for ordering columns)
    position: {
      type: Number,
      default: 0,
    },
    // Relations
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

taskListSchema.index({ project: 1, position: 1 });

module.exports = mongoose.model("TaskList", taskListSchema);
