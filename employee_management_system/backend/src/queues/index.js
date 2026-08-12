const { Queue, Worker } = require("bullmq");
const { REDIS_URL } = require("../config/env");
const logger = require("../utils/logger");
const processEmailJob = require("./workers/email.worker");
const processCleanupJob = require("./workers/cleanup.worker");
const processNotificationJob = require("./workers/notification.worker");

const connection = { url: REDIS_URL };

let emailQueue = null;
let cleanupQueue = null;
let notificationQueue = null;

const getEmailQueue = () => {
  if (!emailQueue) {
    emailQueue = new Queue("email-queue", { connection });
  }
  return emailQueue;
};

const getCleanupQueue = () => {
  if (!cleanupQueue) {
    cleanupQueue = new Queue("cleanup-queue", { connection });
  }
  return cleanupQueue;
};

const getNotificationQueue = () => {
  if (!notificationQueue) {
    notificationQueue = new Queue("notification-queue", { connection });
  }
  return notificationQueue;
};

let emailWorker = null;
let cleanupWorker = null;
let notificationWorker = null;

const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Redis check timed out")), ms));
  return Promise.race([promise, timeout]);
};

const isRedisAvailable = async () => {
  try {
    const { createClient } = require("redis");
    const client = createClient({ url: REDIS_URL });
    client.on("error", () => {});
    await withTimeout(client.connect(), 2000);
    await client.ping();
    await client.quit();
    return true;
  } catch {
    return false;
  }
};

const startWorkers = async () => {
  try {
    const redisOk = await isRedisAvailable();
    if (!redisOk) {
      logger.warn("Redis unavailable — BullMQ workers will not start. Emails and background jobs are disabled.");
      return;
    }

    emailWorker = new Worker("email-queue", processEmailJob, { connection });
    emailWorker.on("failed", (job, err) => {
      logger.error("Email job failed", { jobId: job?.id, message: err.message });
    });

    cleanupWorker = new Worker("cleanup-queue", processCleanupJob, { connection });
    cleanupWorker.on("failed", (job, err) => {
      logger.error("Cleanup job failed", { jobId: job?.id, message: err.message });
    });

    notificationWorker = new Worker("notification-queue", processNotificationJob, { connection });
    notificationWorker.on("failed", (job, err) => {
      logger.error("Notification job failed", { jobId: job?.id, message: err.message });
    });

    logger.info("BullMQ workers started");
  } catch (err) {
    logger.warn("BullMQ unavailable — jobs will fail silently", { message: err.message });
  }
};

const closeQueues = async () => {
  if (emailWorker) await emailWorker.close();
  if (cleanupWorker) await cleanupWorker.close();
  if (notificationWorker) await notificationWorker.close();
  if (emailQueue) await emailQueue.close();
  if (cleanupQueue) await cleanupQueue.close();
  if (notificationQueue) await notificationQueue.close();
};

module.exports = {
  getEmailQueue,
  getCleanupQueue,
  getNotificationQueue,
  startWorkers,
  closeQueues,
};
