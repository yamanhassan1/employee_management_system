const repo = require("../repositories/project.repository");
const ApiError = require("../utils/apiError");
const { del: cacheDel } = require("../integrations/redis");
const { emitToProject } = require("../sockets");

const STATUS_BY_LIST = {
  todo: "pending",
  "to do": "pending",
  pending: "pending",
  "in progress": "in_progress",
  in_progress: "in_progress",
  progress: "in_progress",
  testing: "in_review",
  "in review": "in_review",
  in_review: "in_review",
  "code review": "in_review",
  review: "in_review",
  completed: "completed",
  done: "completed",
  finished: "completed",
};

const statusFromListName = (name) => {
  if (!name) return null;
  return STATUS_BY_LIST[name.trim().toLowerCase()] || null;
};

const isProjectMember = (project, user) =>
  project.owner._id.toString() === user._id.toString() ||
  project.members.some((m) => m._id.toString() === user._id.toString());

const assertProjectAccess = (project, user) => {
  if (!project) throw new ApiError(404, "Project not found");
  if (user.role !== "admin" && !isProjectMember(project, user)) {
    throw new ApiError(403, "Not a member of this project");
  }
};

const invalidateProjectCache = async (projectId) => {
  await cacheDel(`project:${projectId}`);
};

const listProjects = async (user, query) => {
  const { status, search } = query;
  const filter = {};
  if (user.role !== "admin") {
    filter.$or = [{ owner: user._id }, { members: user._id }];
  }
  if (status) filter.status = status;
  if (search) filter.name = { $regex: search, $options: "i" };
  return repo.findProjects(filter);
};

const getProject = async (user, id) => {
  if (!repo.isValidId(id)) throw new ApiError(400, "Invalid project id");
  const project = await repo.findProjectById(id);
  assertProjectAccess(project, user);
  const board = await repo.findBoardData(id);
  return { project, ...board };
};

const createProject = async (user, body) => {
  const { name, description, status, startDate, endDate, members, department } = body;
  if (!name?.trim()) throw new ApiError(422, "Project name is required");

  const project = await repo.createProject({
    name: name.trim(),
    description: description || "",
    status: status || "active",
    startDate: startDate || Date.now(),
    endDate: endDate || null,
    owner: user._id,
    members: members || [],
    department: department || null,
  });

  await repo.createTaskList({ name: "To Do", position: 0, project: project._id, createdBy: user._id });
  return project;
};

const updateProject = async (user, id, body) => {
  if (!repo.isValidId(id)) throw new ApiError(400, "Invalid project id");
  const project = await repo.findProjectById(id);
  if (!project) throw new ApiError(404, "Project not found");

  const isOwner = project.owner._id.toString() === user._id.toString();
  if (user.role !== "admin" && !isOwner) throw new ApiError(403, "Only the owner or admin can update this project");

  const { name, description, status, startDate, endDate, members, department } = body;
  if (name !== undefined) {
    if (!name.trim()) throw new ApiError(422, "Project name cannot be empty");
    project.name = name.trim();
  }
  if (description !== undefined) project.description = description;
  if (status !== undefined) {
    if (!["active", "completed", "on_hold", "cancelled"].includes(status)) throw new ApiError(422, "Invalid status");
    project.status = status;
  }
  if (startDate !== undefined) project.startDate = startDate;
  if (endDate !== undefined) project.endDate = endDate;
  if (members !== undefined) project.members = members;
  if (department !== undefined) project.department = department;

  await repo.saveProject(project);
  await invalidateProjectCache(id);
  emitToProject(id, "board:changed", { type: "project:updated", projectId: id });
  return project;
};

const deleteProject = async (user, id) => {
  if (!repo.isValidId(id)) throw new ApiError(400, "Invalid project id");
  const project = await repo.findProjectById(id);
  if (!project) throw new ApiError(404, "Project not found");

  const isOwner = project.owner._id.toString() === user._id.toString();
  if (user.role !== "admin" && !isOwner) throw new ApiError(403, "Only the owner or admin can delete this project");

  await repo.cascadeDeleteProject(id);
  await repo.deleteProjectById(id);
  await invalidateProjectCache(id);
};

const createTaskList = async (user, projectId, body) => {
  if (!repo.isValidId(projectId)) throw new ApiError(400, "Invalid project id");
  const { name, position } = body;
  if (!name?.trim()) throw new ApiError(422, "List name is required");

  const project = await repo.findProjectById(projectId);
  assertProjectAccess(project, user);

  const count = await repo.countTaskLists(projectId);
  const list = await repo.createTaskList({
    name: name.trim(),
    position: position !== undefined ? position : count,
    project: projectId,
    createdBy: user._id,
  });
  emitToProject(projectId, "board:changed", { type: "list:created", projectId });
  return list;
};

const updateTaskList = async (user, listId, body) => {
  if (!repo.isValidId(listId)) throw new ApiError(400, "Invalid list id");
  const list = await repo.findTaskListById(listId);
  if (!list) throw new ApiError(404, "List not found");

  const { name, position } = body;
  if (name !== undefined) {
    if (!name.trim()) throw new ApiError(422, "List name cannot be empty");
    list.name = name.trim();
  }
  if (position !== undefined) list.position = position;

  await repo.saveTaskList(list);
  emitToProject(list.project.toString(), "board:changed", { type: "list:updated", projectId: list.project });
  return list;
};

const deleteTaskList = async (user, listId) => {
  if (!repo.isValidId(listId)) throw new ApiError(400, "Invalid list id");
  const list = await repo.findTaskListById(listId);
  if (!list) throw new ApiError(404, "List not found");

  await repo.Task.updateMany({ taskList: listId }, { $set: { taskList: null } });
  await repo.deleteTaskListById(listId);
  emitToProject(list.project.toString(), "board:changed", { type: "list:deleted", projectId: list.project });
};

const listTasks = async (user, query) => {
  const { project } = query;
  const filter = {};
  if (project) filter.project = project;
  if (user.role !== "admin") {
    filter.$or = [{ assignedTo: user._id }, { createdBy: user._id }, { department: user.department }];
  }
  return repo.findTasks(filter);
};

const createTask = async (user, projectId, body) => {
  if (!repo.isValidId(projectId)) throw new ApiError(400, "Invalid project id");
  const { title, description, status, priority, dueDate, assignedTo, taskList, labels } = body;
  if (!title?.trim()) throw new ApiError(422, "Task title is required");

  const project = await repo.findProjectById(projectId);
  assertProjectAccess(project, user);

  const task = await repo.createTask({
    title: title.trim(),
    description: description || "",
    status: status || "pending",
    priority: priority || "medium",
    dueDate: dueDate || null,
    assignedTo: assignedTo || null,
    createdBy: user._id,
    project: projectId,
    taskList: taskList || null,
    labels: labels || [],
    department: project.department,
  });
  emitToProject(projectId, "board:changed", { type: "task:created", projectId });
  return task;
};

const getTask = async (user, taskId) => {
  if (!repo.isValidId(taskId)) throw new ApiError(400, "Invalid task id");
  const task = await repo.findTaskById(taskId);
  if (!task) throw new ApiError(404, "Task not found");
  const detail = await repo.findTaskDetail(taskId);
  return { task, ...detail };
};

const updateTask = async (user, taskId, body) => {
  if (!repo.isValidId(taskId)) throw new ApiError(400, "Invalid task id");
  const task = await repo.findTaskById(taskId, false);
  if (!task) throw new ApiError(404, "Task not found");

  const { title, description, status, priority, dueDate, assignedTo, taskList, labels } = body;
  if (title !== undefined) {
    if (!title.trim()) throw new ApiError(422, "Task title cannot be empty");
    task.title = title.trim();
  }
  if (description !== undefined) task.description = description;
  if (status !== undefined) {
    if (!["pending", "in_progress", "in_review", "completed"].includes(status)) throw new ApiError(422, "Invalid status");
    task.status = status;
  }
  if (priority !== undefined) {
    if (!["low", "medium", "high", "urgent"].includes(priority)) throw new ApiError(422, "Invalid priority");
    task.priority = priority;
  }
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (assignedTo !== undefined) task.assignedTo = assignedTo;
  if (taskList !== undefined) task.taskList = taskList;
  if (labels !== undefined) task.labels = labels;

  await repo.saveTask(task);
  emitToProject(task.project.toString(), "task:updated", { taskId, projectId: task.project });
  return task;
};

const moveTask = async (user, taskId, body) => {
  if (!repo.isValidId(taskId)) throw new ApiError(400, "Invalid task id");
  const { taskList, position, status } = body;

  const task = await repo.findTaskById(taskId);
  if (!task) throw new ApiError(404, "Task not found");

  let targetListId = taskList;
  if (targetListId !== undefined && targetListId !== null && !repo.isValidId(targetListId)) {
    throw new ApiError(400, "Invalid task list id");
  }

  let newStatus = status;
  if (newStatus === undefined || newStatus === null) {
    let listName = null;
    if (targetListId !== undefined && targetListId !== null) {
      const tl = await repo.findTaskListById(targetListId);
      listName = tl ? tl.name : null;
    } else if (task.taskList) {
      listName = task.taskList.name;
    }
    const derived = statusFromListName(listName);
    if (derived) newStatus = derived;
  }

  if (newStatus !== undefined && newStatus !== null) {
    if (!["pending", "in_progress", "in_review", "completed"].includes(newStatus)) {
      throw new ApiError(422, "Invalid status");
    }
    task.status = newStatus;
  }

  if (targetListId !== undefined) task.taskList = targetListId || null;
  if (position !== undefined && position !== null) task.position = Number(position);

  await repo.saveTask(task);
  emitToProject(task.project.toString(), "task:moved", { taskId, projectId: task.project });
  return task;
};

const deleteTask = async (user, taskId) => {
  if (!repo.isValidId(taskId)) throw new ApiError(400, "Invalid task id");
  const task = await repo.findTaskById(taskId, false);
  if (!task) throw new ApiError(404, "Task not found");

  await repo.cascadeDeleteTask(taskId);
  await repo.deleteTaskById(taskId);
  emitToProject(task.project.toString(), "board:changed", { type: "task:deleted", projectId: task.project });
};

const createSubtask = async (user, taskId, body) => {
  if (!repo.isValidId(taskId)) throw new ApiError(400, "Invalid task id");
  if (!body.title?.trim()) throw new ApiError(422, "Subtask title is required");
  if (!(await repo.findTaskById(taskId, false))) throw new ApiError(404, "Task not found");
  return repo.createSubtask({ title: body.title.trim(), task: taskId, createdBy: user._id });
};

const updateSubtask = async (user, subtaskId, body) => {
  if (!repo.isValidId(subtaskId)) throw new ApiError(400, "Invalid subtask id");
  const subtask = await repo.findSubtaskById(subtaskId);
  if (!subtask) throw new ApiError(404, "Subtask not found");
  if (body.title !== undefined) subtask.title = body.title.trim();
  if (body.completed !== undefined) subtask.completed = body.completed;
  await repo.saveSubtask(subtask);
  return subtask;
};

const deleteSubtask = async (user, subtaskId) => {
  if (!repo.isValidId(subtaskId)) throw new ApiError(400, "Invalid subtask id");
  const subtask = await repo.findSubtaskById(subtaskId);
  if (!subtask) throw new ApiError(404, "Subtask not found");
  await repo.deleteSubtaskById(subtaskId);
};

const createLabel = async (user, projectId, body) => {
  if (!repo.isValidId(projectId)) throw new ApiError(400, "Invalid project id");
  if (!body.name?.trim()) throw new ApiError(422, "Label name is required");
  if (!(await repo.findProjectById(projectId))) throw new ApiError(404, "Project not found");
  return repo.createLabel({
    name: body.name.trim(),
    color: body.color || "#6366f1",
    project: projectId,
    createdBy: user._id,
  });
};

const deleteLabel = async (user, labelId) => {
  if (!repo.isValidId(labelId)) throw new ApiError(400, "Invalid label id");
  const label = await repo.findLabelById(labelId);
  if (!label) throw new ApiError(404, "Label not found");
  await repo.Task.updateMany({ labels: labelId }, { $pull: { labels: labelId } });
  await repo.deleteLabelById(labelId);
};

const createComment = async (user, taskId, body) => {
  if (!repo.isValidId(taskId)) throw new ApiError(400, "Invalid task id");
  if (!body.content?.trim()) throw new ApiError(422, "Comment cannot be empty");
  if (!(await repo.findTaskById(taskId, false))) throw new ApiError(404, "Task not found");
  return repo.createComment({ content: body.content.trim(), task: taskId, author: user._id });
};

const deleteComment = async (user, commentId) => {
  if (!repo.isValidId(commentId)) throw new ApiError(400, "Invalid comment id");
  const comment = await repo.findCommentById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");
  const isAuthor = comment.author.toString() === user._id.toString();
  if (user.role !== "admin" && !isAuthor) throw new ApiError(403, "Only the author or admin can delete this comment");
  await repo.deleteCommentById(commentId);
};

const createAttachment = async (user, taskId, body) => {
  if (!repo.isValidId(taskId)) throw new ApiError(400, "Invalid task id");
  const { filename, url, size, mimeType } = body;
  if (!filename || !url) throw new ApiError(422, "Filename and URL are required");
  if (!(await repo.findTaskById(taskId, false))) throw new ApiError(404, "Task not found");
  return repo.createAttachment({
    filename,
    url,
    size: size || 0,
    mimeType: mimeType || "",
    task: taskId,
    uploadedBy: user._id,
  });
};

const deleteAttachment = async (user, attachmentId) => {
  if (!repo.isValidId(attachmentId)) throw new ApiError(400, "Invalid attachment id");
  const attachment = await repo.findAttachmentById(attachmentId);
  if (!attachment) throw new ApiError(404, "Attachment not found");
  await repo.deleteAttachmentById(attachmentId);
};

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
  createTask,
  getTask,
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
