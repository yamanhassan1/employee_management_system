const express = require("express");
const router = express.Router();

const { listUsers, getUser, updateUserRole, updateUserManager, updateUserDepartment, updateUser } = require("../controllers/user.controller");
const authenticate = require("../middlewares/authenticate.midlleware");
const authorize = require("../middlewares/authorize.midlleware");

// All user management routes require authentication + admin role
router.use(authenticate, authorize("admin"));

router.get("/", listUsers);
router.get("/:id", getUser);
router.patch("/:id/role", updateUserRole);
router.patch("/:id/manager", updateUserManager);
router.patch("/:id/department", updateUserDepartment);
router.patch("/:id", updateUser);

module.exports = router;
