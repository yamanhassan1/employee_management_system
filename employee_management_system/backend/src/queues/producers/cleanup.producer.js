const { getCleanupQueue } = require("../index");

const enqueueTokenCleanup = async () => {
  const queue = getCleanupQueue();
  await queue.add("cleanup-tokens", {}, { attempts: 3, backoff: { type: "exponential", delay: 5000 } });
};

const enqueueSessionCleanup = async () => {
  const queue = getCleanupQueue();
  await queue.add("cleanup-sessions", {}, { attempts: 3, backoff: { type: "exponential", delay: 5000 } });
};

module.exports = { enqueueTokenCleanup, enqueueSessionCleanup };
