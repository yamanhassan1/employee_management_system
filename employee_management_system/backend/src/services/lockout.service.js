const { MAX_LOGIN_ATTEMPTS, LOCK_MINUTES } = require("../config/env");

const isAccountLocked = (user) => !!(user.lockUntil && user.lockUntil > Date.now());

const handleFailedLogin = async (user) => {
  user.failedLoginAttempts += 1;

  if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
    user.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
    user.failedLoginAttempts = 0;
  }

  await user.save({ validateBeforeSave: false });
};

const handleSuccessfulLogin = async (user) => {
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });
};

const getRemainingLockTime = (user) => {
  if (!isAccountLocked(user)) return 0;
  return Math.ceil((user.lockUntil.getTime() - Date.now()) / 1000 / 60); // minutes
};

module.exports = { isAccountLocked, handleFailedLogin, handleSuccessfulLogin, getRemainingLockTime };