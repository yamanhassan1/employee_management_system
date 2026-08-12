const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: "",
    },
    // Relations
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attachment", attachmentSchema);
