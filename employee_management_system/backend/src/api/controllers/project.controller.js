const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const projectService = require("../../services/project.service");

const listProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.listProjects(req.user, req.query);
  res.status(200).json(new ApiResponse(200, projects, "Projects fetched"));
});

const getProject = asyncHandler(async (req, res) => {
  const data = await projectService.getProject(req.user, req.params.id);
  res.status(200).json(new ApiResponse(200, data, "Project fetched"));
});

const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.user, req.body);
  res.status(201).json(new ApiResponse(201, project, "Project created"));
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(req.user, req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, project, "Project updated"));
});

const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.user, req.params.id);
  res.status(200).json(new ApiResponse(200, null, "Project deleted"));
});

const createTaskList = asyncHandler(async (req, res) => {
  const list = await projectService.createTaskList(req.user, req.params.id, req.body);
  res.status(201).json(new ApiResponse(201, list, "List created"));
});

const updateTaskList = asyncHandler(async (req, res) => {
  const list = await projectService.updateTaskList(req.user, req.params.listId, req.body);
  res.status(200).json(new ApiResponse(200, list, "List updated"));
});

const deleteTaskList = asyncHandler(async (req, res) => {
  await projectService.deleteTaskList(req.user, req.params.listId);
  res.status(200).json(new ApiResponse(200, null, "List deleted"));
});

const listTasks = asyncHandler(async (req, res) => {
  const tasks = await projectService.listTasks(req.user, req.query);
  res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched"));
});

const createTask = asyncHandler(async (req, res) => {
  const task = await projectService.createTask(req.user, req.params.id, req.body);
  res.status(201).json(new ApiResponse(201, task, "Task created"));
});

const getTask = asyncHandler(async (req, res) => {
  const data = await projectService.getTask(req.user, req.params.taskId);
  res.status(200).json(new ApiResponse(200, data, "Task detail fetched"));
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await projectService.updateTask(req.user, req.params.taskId, req.body);
  res.status(200).json(new ApiResponse(200, task, "Task updated"));
});

const moveTask = asyncHandler(async (req, res) => {
  const task = await projectService.moveTask(req.user, req.params.taskId, req.body);
  res.status(200).json(new ApiResponse(200, task, "Task moved"));
});

const deleteTask = asyncHandler(async (req, res) => {
  await projectService.deleteTask(req.user, req.params.taskId);
  res.status(200).json(new ApiResponse(200, null, "Task deleted"));
});

const createSubtask = asyncHandler(async (req, res) => {
  const subtask = await projectService.createSubtask(req.user, req.params.taskId, req.body);
  res.status(201).json(new ApiResponse(201, subtask, "Subtask created"));
});

const updateSubtask = asyncHandler(async (req, res) => {
  const subtask = await projectService.updateSubtask(req.user, req.params.subtaskId, req.body);
  res.status(200).json(new ApiResponse(200, subtask, "Subtask updated"));
});

const deleteSubtask = asyncHandler(async (req, res) => {
  await projectService.deleteSubtask(req.user, req.params.subtaskId);
  res.status(200).json(new ApiResponse(200, null, "Subtask deleted"));
});

const createLabel = asyncHandler(async (req, res) => {
  const label = await projectService.createLabel(req.user, req.params.id, req.body);
  res.status(201).json(new ApiResponse(201, label, "Label created"));
});

const deleteLabel = asyncHandler(async (req, res) => {
  await projectService.deleteLabel(req.user, req.params.labelId);
  res.status(200).json(new ApiResponse(200, null, "Label deleted"));
});

const createComment = asyncHandler(async (req, res) => {
  const comment = await projectService.createComment(req.user, req.params.taskId, req.body);
  res.status(201).json(new ApiResponse(201, comment, "Comment added"));
});

const deleteComment = asyncHandler(async (req, res) => {
  await projectService.deleteComment(req.user, req.params.commentId);
  res.status(200).json(new ApiResponse(200, null, "Comment deleted"));
});

const createAttachment = asyncHandler(async (req, res) => {
  const attachment = await projectService.createAttachment(req.user, req.params.taskId, req.body);
  res.status(201).json(new ApiResponse(201, attachment, "Attachment added"));
});

const deleteAttachment = asyncHandler(async (req, res) => {
  await projectService.deleteAttachment(req.user, req.params.attachmentId);
  res.status(200).json(new ApiResponse(200, null, "Attachment deleted"));
});

module.exports = {
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
};
