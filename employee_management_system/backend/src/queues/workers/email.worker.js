const emailService = require("../../services/email.service");

const processEmailJob = async (job) => {
  const { type, payload } = job.data;
  switch (type) {
    case "welcome":
      await emailService.sendWelcomeEmail(payload.email, payload.name);
      break;
    case "verification":
      await emailService.sendVerificationEmail(payload.email, payload.token);
      break;
    case "password-reset":
      await emailService.sendPasswordResetEmail(payload.email, payload.token);
      break;
    default:
      throw new Error(`Unknown email job type: ${type}`);
  }
};

module.exports = processEmailJob;
