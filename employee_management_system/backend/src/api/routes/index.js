const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth.routes"));
router.use("/password", require("./password.routes"));
router.use("/email", require("./email.routes"));
router.use("/sessions", require("./session.routes"));
router.use("/users", require("./user.routes"));
router.use("/departments", require("./department.routes"));
router.use("/dashboard", require("./dashboard.routes"));
router.use("/projects", require("./project.routes"));
router.use("/notifications", require("./notification.routes"));
router.use("/calendar", require("./calendar.routes"));

module.exports = router;