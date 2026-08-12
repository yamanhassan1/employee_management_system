const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate.midlleware");
const {
  listNotifications,
  markRead,
  markAllRead,
} = require("../controllers/notification.controller");

router.use(authenticate);

router.get("/", listNotifications);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markRead);

module.exports = router;
