const mongoose = require("mongoose");
const { hashPassword, comparePassword } = require("../utils/hashPassword");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // never returned by default
    },
    role: {
      type: String,
      enum: ["admin", "manager", "employee"],
      default: "employee",
    },
    // Role-based relationships: a user may report to a manager and belong to a department
    reportsTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    jobTitle: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before save
// NOTE: In Mongoose 9, async pre hooks are promise-based — `next` is NOT passed.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await hashPassword(this.password);
});

// Compare password
userSchema.methods.comparePassword = function (candidatePassword) {
  return comparePassword(candidatePassword, this.password);
};

// Reset failed login attempts and lock (used after password reset)
userSchema.methods.resetLoginAttempts = function () {
  this.failedLoginAttempts = 0;
  this.lockUntil = null;
};

// Strip password from serialized output
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
