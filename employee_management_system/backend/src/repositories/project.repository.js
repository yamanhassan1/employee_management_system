const mongoose = require("mongoose");
const Project = require("../models/project.model");
const TaskList = require("../models/taskList.model");
const Task = require("../models/task.model");
const Subtask = require("../models/subtask.model");
const Label = require("../models/label.model");
const TaskComment = require("../models/taskComment.model");
const Attachment = require("../models/attachment.model");

const isValidId = (id) => mongoose.isValidObjectId(id);

const findProjects = (filter) =>
  Project.find(filter)
    .populate("owner", "name email")
    .populate("members", "name email")
    .populate("department", "name")
    .sort({ createdAt: -1 });

const findProjectById = (id) =>
  Project.findById(id)
    .populate("owner", "name email")
    .populate("members", "name email")
    .populate("department", "name");

const createProject = (data) => Project.create(data);

const saveProject = (project) => project.save();

const deleteProjectById = (id) => Project.findByIdAndDelete(id);

const findBoardData = async (projectId) => {
  const [lists, labels, tasks] = await Promise.all([
    TaskList.find({ project: projectId }).sort({ position: 1 }),
    Label.find({ project: projectId }).sort({ createdAt: 1 }),
    Task.find({ project: projectId })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("labels", "name color")
      .populate("taskList", "name")
      .sort({ position: 1 }),
  ]);
  return { lists, labels, tasks };
};

const createTaskList = (data) => TaskList.create(data);
const countTaskLists = (projectId) => TaskList.countDocuments({ project: projectId });
const findTaskListById = (id) => TaskList.findById(id);
const saveTaskList = (list) => list.save();
const deleteTaskListById = (id) => TaskList.findByIdAndDelete(id);

const findTasks = (filter) =>
  Task.find(filter)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .populate("labels", "name color")
    .populate("taskList", "name")
    .populate("project", "name")
    .sort({ createdAt: -1 });

const findTaskById = (id, populate = true) => {
  let q = Task.findById(id);
  if (populate) {
    q = q
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("labels", "name color")
      .populate("taskList", "name")
      .populate("project", "name");
  }
  return q;
};

const createTask = (data) => Task.create(data);
const saveTask = (task) => task.save();
const deleteTaskById = (id) => Task.findByIdAndDelete(id);
const findTaskIdsByProject = (projectId) => Task.find({ project: projectId }).select("_id");

const findTaskDetail = async (taskId) => {
  const [subtasks, comments, attachments] = await Promise.all([
    Subtask.find({ task: taskId }).sort({ createdAt: 1 }),
    TaskComment.find({ task: taskId }).populate("author", "name email").sort({ createdAt: -1 }),
    Attachment.find({ task: taskId }).populate("uploadedBy", "name email"),
  ]);
  return { subtasks, comments, attachments };
};

const createSubtask = (data) => Subtask.create(data);
const findSubtaskById = (id) => Subtask.findById(id);
const saveSubtask = (subtask) => subtask.save();
const deleteSubtaskById = (id) => Subtask.findByIdAndDelete(id);

const createLabel = (data) => Label.create(data);
const findLabelById = (id) => Label.findById(id);
const deleteLabelById = (id) => Label.findByIdAndDelete(id);

const createComment = (data) => TaskComment.create(data);
const findCommentById = (id) => TaskComment.findById(id);
const deleteCommentById = (id) => TaskComment.findByIdAndDelete(id);

const createAttachment = (data) => Attachment.create(data);
const findAttachmentById = (id) => Attachment.findById(id);
const deleteAttachmentById = (id) => Attachment.findByIdAndDelete(id);

const cascadeDeleteProject = async (projectId) => {
  const taskIds = await findTaskIdsByProject(projectId);
  const ids = taskIds.map((t) => t._id);
  await Promise.all([
    Subtask.deleteMany({ task: { $in: ids } }),
    TaskComment.deleteMany({ task: { $in: ids } }),
    Attachment.deleteMany({ task: { $in: ids } }),
    Task.deleteMany({ project: projectId }),
    TaskList.deleteMany({ project: projectId }),
    Label.deleteMany({ project: projectId }),
  ]);
};

const cascadeDeleteTask = async (taskId) => {
  await Promise.all([
    Subtask.deleteMany({ task: taskId }),
    TaskComment.deleteMany({ task: taskId }),
    Attachment.deleteMany({ task: taskId }),
  ]);
};

module.exports = {
  isValidId,
  findProjects,
  findProjectById,
  createProject,
  saveProject,
  deleteProjectById,
  findBoardData,
  createTaskList,
  countTaskLists,
  findTaskListById,
  saveTaskList,
  deleteTaskListById,
  findTasks,
  findTaskById,
  createTask,
  saveTask,
  deleteTaskById,
  findTaskDetail,
  createSubtask,
  findSubtaskById,
  saveSubtask,
  deleteSubtaskById,
  createLabel,
  findLabelById,
  deleteLabelById,
  createComment,
  findCommentById,
  deleteCommentById,
  createAttachment,
  findAttachmentById,
  deleteAttachmentById,
  cascadeDeleteProject,
  cascadeDeleteTask,
  Task,
};
