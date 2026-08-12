const mongoose = require("mongoose");

const labelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      default: "#6366f1",
    },
    // Relations: labels belong to a project and can be applied to many tasks
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

labelSchema.index({ project: 1, name: 1 });

module.exports = mongoose.model("Label", labelSchema);
