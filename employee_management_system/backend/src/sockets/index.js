const { Server } = require("socket.io");
const { CLIENT_URL } = require("../config/env");
const socketAuth = require("./auth");
const setupNotificationsNamespace = require("./notifications.namespace");
const setupProjectsNamespace = require("./projects.namespace");
const logger = require("../utils/logger");

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: CLIENT_URL, credentials: true },
  });

  io.use(socketAuth);

  setupNotificationsNamespace(io);
  setupProjectsNamespace(io);

  logger.info("Socket.IO initialized");
  return io;
};

const getIO = () => io;

const emitToProject = (projectId, event, payload) => {
  if (io) io.of("/projects").to(`project:${projectId}`).emit(event, payload);
};

const emitToUser = (userId, event, payload) => {
  if (io) io.of("/notifications").to(`user:${userId}`).emit(event, payload);
};

module.exports = { initSocket, getIO, emitToProject, emitToUser };
