const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { PORT } = require("./config/env");
const logger = require("./utils/logger");
const { initSocket } = require("./sockets");
const { closeRedis } = require("./integrations/redis");
const { startWorkers, closeQueues } = require("./queues");

const startServer = async () => {
  await connectDB();
  await startWorkers();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await closeQueues();
      await closeRedis();
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

startServer().catch((err) => {
  logger.error("Failed to start server", { message: err.message });
  process.exit(1);
});
