const logger = require("../utils/logger");

const setupProjectsNamespace = (io) => {
  io.of("/projects").on("connection", (socket) => {
    socket.on("join:project", (projectId) => {
      socket.join(`project:${projectId}`);
    });
    socket.on("leave:project", (projectId) => {
      socket.leave(`project:${projectId}`);
    });
  });
};

module.exports = setupProjectsNamespace;
