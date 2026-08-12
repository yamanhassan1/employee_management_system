const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/apiError");
const ApiResponse = require("../../utils/apiResponse");
const Department = require("../../models/department.model");
const User = require("../../models/user.model");

// GET /departments — list departments (admin/manager)
const listDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().populate("head", "name email");
  res.status(200).json(new ApiResponse(200, departments, "Departments fetched"));
});

// POST /departments — create a department (admin only)
const createDepartment = asyncHandler(async (req, res) => {
  const { name, description, head } = req.body;
  if (await Department.findOne({ name })) throw new ApiError(409, "Department already exists");

  if (head) {
    const headUser = await User.findById(head);
    if (!headUser) throw new ApiError(404, "Head user not found");
  }

  const department = await Department.create({ name, description, head: head || null });
  res.status(201).json(new ApiResponse(201, department, "Department created"));
});

// PATCH /departments/:id — update department (admin only)
const updateDepartment = asyncHandler(async (req, res) => {
  const { name, description, head } = req.body;
  const department = await Department.findById(req.params.id);
  if (!department) throw new ApiError(404, "Department not found");

  if (name) department.name = name;
  if (description !== undefined) department.description = description;
  if (head !== undefined) {
    if (head) {
      const headUser = await User.findById(head);
      if (!headUser) throw new ApiError(404, "Head user not found");
    }
    department.head = head || null;
  }

  await department.save();
  res.status(200).json(new ApiResponse(200, department, "Department updated"));
});

// DELETE /departments/:id — delete a department (admin only)
const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) throw new ApiError(404, "Department not found");

  // Detach users assigned to this department
  await User.updateMany({ department: department._id }, { $set: { department: null } });

  res.status(200).json(new ApiResponse(200, null, "Department deleted"));
});

module.exports = { listDepartments, createDepartment, updateDepartment, deleteDepartment };
