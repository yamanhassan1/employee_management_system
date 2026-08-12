const express = require("express");
const router = express.Router();

const { listDepartments, createDepartment, updateDepartment, deleteDepartment } = require("../controllers/department.controller");
const authenticate = require("../middlewares/authenticate.midlleware");
const authorize = require("../middlewares/authorize.midlleware");

// List departments: authenticated admin or manager
router.get("/", authenticate, authorize("admin", "manager"), listDepartments);

// Mutations: admin only
router.post("/", authenticate, authorize("admin"), createDepartment);
router.patch("/:id", authenticate, authorize("admin"), updateDepartment);
router.delete("/:id", authenticate, authorize("admin"), deleteDepartment);

module.exports = router;
