const express = require("express");
const router = express.Router();

const { register, login, refresh, logout, logoutAllDevices, getCurrentUser, updateMyProfile } = require("../controllers/auth.controller");
const authenticate = require("../middlewares/authenticate.midlleware");
const validateRequest = require("../middlewares/validateRequest.midlleware");
const { loginRateLimiter } = require("../middlewares/rateLimiter.midlleware");
const { registerSchema, loginSchema } = require("../validations/auth.validation");

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", loginRateLimiter, validateRequest(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/logout-all", authenticate, logoutAllDevices);
router.get("/me", authenticate, getCurrentUser);
router.patch("/me", authenticate, updateMyProfile);

module.exports = router;
