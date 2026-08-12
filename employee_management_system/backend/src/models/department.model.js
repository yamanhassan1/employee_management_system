const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
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
    // Manager (User) who heads this department
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

departmentSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model("Department", departmentSchema);
