const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const { getManagerStats, getEmployeeStats } = require("../../services/dashboard.service");

// GET /dashboard/manager — manager/admin dashboard stats + analytics
const getManagerDashboard = asyncHandler(async (req, res) => {
  const data = await getManagerStats(req.user);
  res.status(200).json(new ApiResponse(200, data, "Manager dashboard data fetched"));
});

// GET /dashboard/employee — employee dashboard data
const getEmployeeDashboard = asyncHandler(async (req, res) => {
  const data = await getEmployeeStats(req.user);
  res.status(200).json(new ApiResponse(200, data, "Employee dashboard data fetched"));
});

module.exports = { getManagerDashboard, getEmployeeDashboard };
