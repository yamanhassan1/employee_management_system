/**
 * User Repository
 * ----------------
 * Data-access layer for the User model.
 *
 * Responsibilities:
 *  - Encapsulate all Mongoose queries against the User collection.
 *  - Keep controllers/services free of database-specific syntax.
 *  - Centralize projections, population, and index-friendly filtering.
 *
 * Why this exists (SRP / DIP):
 *  - Controllers handle HTTP, services handle business rules,
 *    repositories own the data shape. Swapping Mongoose for another
 *    driver later only touches this folder.
 */
const User = require("../models/user.model");

const PUBLIC_PROJECTION = "-password -__v";

/**
 * Find a single user by email (used by login + rate limiting).
 * @param {string} email
 * @returns {Promise<import('mongoose').Query>}
 */
const findByEmail = (email) => User.findOne({ email });

/**
 * Find a user by id with safe public fields.
 * @param {string} id
 */
const findById = (id) => User.findById(id).select(PUBLIC_PROJECTION);

/**
 * Find a user by id WITH the password hash (login comparison).
 * @param {string} id
 */
const findByIdWithPassword = (id) => User.findById(id).select("+password");

/**
 * List users with optional filters + pagination (admin only).
 * Returns the raw mongoose documents; controller wraps them.
 * @param {{ role?: string, department?: string, search?: string, page?: number, limit?: number }} query
 */
const list = async ({ role, department, search, page = 1, limit = 20 }) => {
  const filter = {};
  if (role) filter.role = role;
  if (department) filter.department = department;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (safePage - 1) * safeLimit;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(PUBLIC_PROJECTION)
      .populate("reportsTo", "name email")
      .populate("department", "name")
      .skip(skip)
      .limit(safeLimit)
      .sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  return { users, total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) };
};

/**
 * Update a user's role with a guard against invalid values.
 * @param {string} id
 * @param {string} role  admin | manager | employee
 */
const updateRole = (id, role) => User.findByIdAndUpdate(id, { role }, { new: true }).select(PUBLIC_PROJECTION);

/**
 * Update a user's manager (reportsTo) reference.
 * @param {string} id
 * @param {string|null} managerId
 */
const updateManager = (id, managerId) =>
  User.findByIdAndUpdate(id, { reportsTo: managerId || null }, { new: true }).select(PUBLIC_PROJECTION);

/**
 * Update a user's department reference.
 * @param {string} id
 * @param {string|null} departmentId
 */
const updateDepartment = (id, departmentId) =>
  User.findByIdAndUpdate(id, { department: departmentId || null }, { new: true }).select(PUBLIC_PROJECTION);

/**
 * Update general profile fields (name, jobTitle).
 * @param {string} id
 * @param {{ name?: string, jobTitle?: string }} fields
 */
const updateProfile = (id, { name, jobTitle }) =>
  User.findByIdAndUpdate(
    id,
    { $set: { ...(name !== undefined && { name }), ...(jobTitle !== undefined && { jobTitle }) } },
    { new: true }
  ).select(PUBLIC_PROJECTION);

/**
 * Increment failed login attempts and set lockUntil when threshold reached.
 * @param {string} id
 * @param {number} maxAttempts
 * @param {number} lockMinutes
 */
const incrementLoginAttempts = (id, maxAttempts, lockMinutes) =>
  User.findByIdAndUpdate(
    id,
    {
      $inc: { failedLoginAttempts: 1 },
      ...(lockMinutes ? { $setOnInsert: {} } : {}),
    },
    { new: true }
  );

/**
 * Reset login attempts + lock (after successful login / password reset).
 * @param {string} id
 */
const resetLoginAttempts = (id) =>
  User.findByIdAndUpdate(
    id,
    { $set: { failedLoginAttempts: 0, lockUntil: null } },
    { new: true }
  ).select(PUBLIC_PROJECTION);

/**
 * Persist lastLoginAt timestamp.
 * @param {string} id
 */
const touchLastLogin = (id) => User.findByIdAndUpdate(id, { $set: { lastLoginAt: new Date() } });

module.exports = {
  findByEmail,
  findById,
  findByIdWithPassword,
  list,
  updateRole,
  updateManager,
  updateDepartment,
  updateProfile,
  incrementLoginAttempts,
  resetLoginAttempts,
  touchLastLogin,
};

