const express = require("express");
const router = express.Router();

const { getManagerDashboard, getEmployeeDashboard } = require("../controllers/dashboard.controller");
const authenticate = require("../middlewares/authenticate.midlleware");
const authorize = require("../middlewares/authorize.midlleware");

// Manager dashboard: accessible to admin + manager
router.get("/manager", authenticate, authorize("admin", "manager"), getManagerDashboard);

// Employee dashboard: accessible to any authenticated user
router.get("/employee", authenticate, getEmployeeDashboard);

module.exports = router;
