const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate.midlleware");
const {
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/calendar.controller");

router.use(authenticate);

router.get("/", listEvents);
router.post("/", createEvent);
router.patch("/:id", updateEvent);
router.delete("/:id", deleteEvent);

module.exports = router;
