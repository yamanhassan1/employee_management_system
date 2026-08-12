const RefreshToken = require("../../models/refreshToken.model");
const Session = require("../../models/session.model");

const processCleanupJob = async (job) => {
  const { type } = job.data;
  switch (type) {
    case "cleanup-tokens":
      await RefreshToken.deleteMany({ expiresAt: { $lt: new Date() }, isRevoked: true });
      break;
    case "cleanup-sessions":
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      await Session.deleteMany({ isRevoked: true, updatedAt: { $lt: thirtyDaysAgo } });
      break;
    default:
      throw new Error(`Unknown cleanup job type: ${type}`);
  }
};

module.exports = processCleanupJob;
