const express = require("express");
const router = express.Router();

const { getSessions, revokeSession } = require("../controllers/session.controller");
const authenticate = require("../middlewares/authenticate.midlleware");

router.use(authenticate);
router.get("/", getSessions);
router.delete("/:sessionId", revokeSession);

module.exports = router;