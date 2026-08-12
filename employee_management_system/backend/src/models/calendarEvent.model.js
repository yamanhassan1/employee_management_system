const mongoose = require("mongoose");

const calendarEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["meeting", "deadline", "task", "holiday", "other"],
      default: "other",
    },
    // Optional relation to a task
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
  },
  { timestamps: true }
);

calendarEventSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model("CalendarEvent", calendarEventSchema);
