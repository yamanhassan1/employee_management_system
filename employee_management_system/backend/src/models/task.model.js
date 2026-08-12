const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "in_review", "completed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    // Relations
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    // The board column/list this task belongs to
    taskList: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaskList",
      default: null,
    },
    // Labels applied to this task
    labels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Label",
      },
    ],
    // Position within a list (for ordering)
    position: {
      type: Number,
      default: 0,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
  },
  { timestamps: true }
);

taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ project: 1 });
taskSchema.index({ taskList: 1, position: 1 });
taskSchema.index({ department: 1 });

module.exports = mongoose.model("Task", taskSchema);
