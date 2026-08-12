const { getEmailQueue } = require("../index");

const enqueueWelcomeEmail = async (email, name) => {
  const queue = getEmailQueue();
  await queue.add("welcome", { email, name }, { attempts: 3, backoff: { type: "exponential", delay: 5000 } });
};

const enqueueVerificationEmail = async (email, token) => {
  const queue = getEmailQueue();
  await queue.add("verification", { email, token }, { attempts: 3, backoff: { type: "exponential", delay: 5000 } });
};

const enqueuePasswordResetEmail = async (email, token) => {
  const queue = getEmailQueue();
  await queue.add("password-reset", { email, token }, { attempts: 3, backoff: { type: "exponential", delay: 5000 } });
};

module.exports = { enqueueWelcomeEmail, enqueueVerificationEmail, enqueuePasswordResetEmail };
