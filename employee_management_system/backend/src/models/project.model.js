const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
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
      enum: ["active", "completed", "on_hold", "cancelled"],
      default: "active",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    // Relations
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
  },
  { timestamps: true }
);

projectSchema.index({ owner: 1 });
projectSchema.index({ department: 1 });
projectSchema.index({ status: 1 });

module.exports = mongoose.model("Project", projectSchema);
