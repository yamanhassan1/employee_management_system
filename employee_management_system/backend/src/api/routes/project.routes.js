const express = require("express");
const router = express.Router();

const {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  createTaskList,
  updateTaskList,
  deleteTaskList,
listTasks,
  getTask,
  createTask,
  updateTask,
  moveTask,
  deleteTask,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  createLabel,
  deleteLabel,
  createComment,
  deleteComment,
  createAttachment,
  deleteAttachment,
} = require("../controllers/project.controller");
const authenticate = require("../middlewares/authenticate.midlleware");

// All project routes require authentication
router.use(authenticate);

// ---- Static / collection routes FIRST (must precede /:id) ----

// Tasks collection
router.get("/tasks", listTasks);
router.get("/tasks/:taskId", getTask);
router.patch("/tasks/:taskId", updateTask);
router.patch("/tasks/:taskId/move", moveTask);
router.delete("/tasks/:taskId", deleteTask);

// Subtasks (task-scoped)
router.post("/tasks/:taskId/subtasks", createSubtask);
router.patch("/subtasks/:subtaskId", updateSubtask);
router.delete("/subtasks/:subtaskId", deleteSubtask);

// Comments (task-scoped)
router.post("/tasks/:taskId/comments", createComment);
router.delete("/comments/:commentId", deleteComment);

// Attachments (task-scoped)
router.post("/tasks/:taskId/attachments", createAttachment);
router.delete("/attachments/:attachmentId", deleteAttachment);

// Task lists (board columns)
router.patch("/task-lists/:listId", updateTaskList);
router.delete("/task-lists/:listId", deleteTaskList);

// Labels
router.delete("/labels/:labelId", deleteLabel);

// ---- Projects (with :id) ----
router.get("/", listProjects);
router.post("/", createProject);
router.get("/:id", getProject);
router.patch("/:id", updateProject);
router.delete("/:id", deleteProject);

// Project-scoped sub-resources (after generic /:id but before catch-all)
router.post("/:id/lists", createTaskList);
router.post("/:id/tasks", createTask);
router.post("/:id/labels", createLabel);

module.exports = router;
