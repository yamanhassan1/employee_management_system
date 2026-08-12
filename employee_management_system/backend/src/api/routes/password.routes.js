const express = require("express");
const router = express.Router();

const { forgotPassword, resetPassword } = require("../controllers/password.controller");
const validateRequest = require("../middlewares/validateRequest.midlleware");
const { forgotPasswordRateLimiter } = require("../middlewares/rateLimiter.midlleware");
const { forgotPasswordSchema, resetPasswordSchema } = require("../validations/password.validation");

router.post("/forgot", forgotPasswordRateLimiter, validateRequest(forgotPasswordSchema), forgotPassword);
router.post("/reset", validateRequest(resetPasswordSchema), resetPassword);

module.exports = router;