const express = require("express");
const router = express.Router();

const { verifyEmail, resendVerificationEmail } = require("../controllers/email.controller");

router.post("/verify", verifyEmail);
router.post("/resend", resendVerificationEmail);

module.exports = router;