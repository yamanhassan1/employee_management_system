const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/apiError");
const ApiResponse = require("../../utils/apiResponse");
const User = require("../../models/user.model");
const Department = require("../../models/department.model");

// GET /users — list users (admin only) with optional role/department filter + pagination
const listUsers = asyncHandler(async (req, res) => {
  const { role, department, search } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

  const filter = {};
  if (role) filter.role = role;
  if (department) filter.department = department;
  if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];

  const [users, total] = await Promise.all([
    User.find(filter)
      .populate("reportsTo", "name email")
      .populate("department", "name")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, { users, total, page, limit, totalPages: Math.ceil(total / limit) }, "Users fetched")
  );
});

// GET /users/:id — get a single user (admin only)
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate("reportsTo", "name email").populate("department", "name");
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json(new ApiResponse(200, user, "User fetched"));
});

// PATCH /users/:id/role — update a user's role (admin only)
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!["admin", "manager", "employee"].includes(role)) throw new ApiError(422, "Invalid role");

  const target = await User.findById(req.params.id);
  if (!target) throw new ApiError(404, "User not found");

  // Prevent an admin from demoting themselves (avoid locking out the only admin)
  if (target._id.toString() === req.user._id.toString() && role !== "admin") {
    throw new ApiError(400, "You cannot change your own role");
  }

  target.role = role;
  await target.save();
  res.status(200).json(new ApiResponse(200, target, "Role updated"));
});

// PATCH /users/:id/manager — assign a manager (reportsTo) to a user (admin only)
const updateUserManager = asyncHandler(async (req, res) => {
  const { managerId } = req.body;

  const target = await User.findById(req.params.id);
  if (!target) throw new ApiError(404, "User not found");

  if (managerId) {
    const manager = await User.findById(managerId);
    if (!manager) throw new ApiError(404, "Manager not found");
    if (manager.role !== "manager" && manager.role !== "admin") {
      throw new ApiError(400, "Manager must have a manager or admin role");
    }
    if (managerId === target._id.toString()) throw new ApiError(400, "A user cannot report to themselves");
  }

  target.reportsTo = managerId || null;
  await target.save();

  res.status(200).json(new ApiResponse(200, target, "Manager assigned"));
});

// PATCH /users/:id/department — assign a department to a user (admin only)
const updateUserDepartment = asyncHandler(async (req, res) => {
  const { departmentId } = req.body;

  const target = await User.findById(req.params.id);
  if (!target) throw new ApiError(404, "User not found");

  if (departmentId) {
    const dept = await Department.findById(departmentId);
    if (!dept) throw new ApiError(404, "Department not found");
  }

  target.department = departmentId || null;
  await target.save();

  res.status(200).json(new ApiResponse(200, target, "Department assigned"));
});

// PATCH /users/:id — update general profile fields (jobTitle, name) (admin only)
const updateUser = asyncHandler(async (req, res) => {
  const { jobTitle, name } = req.body;
  const target = await User.findById(req.params.id);
  if (!target) throw new ApiError(404, "User not found");

  if (name !== undefined) target.name = name;
  if (jobTitle !== undefined) target.jobTitle = jobTitle;
  await target.save();

  res.status(200).json(new ApiResponse(200, target, "User updated"));
});

module.exports = { listUsers, getUser, updateUserRole, updateUserManager, updateUserDepartment, updateUser };
