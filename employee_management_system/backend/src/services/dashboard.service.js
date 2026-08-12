const User = require("../models/user.model");
const Session = require("../models/session.model");
const Task = require("../models/task.model");
const Project = require("../models/project.model");
const Notification = require("../models/notification.model");
const ActivityLog = require("../models/activityLog.model");
const CalendarEvent = require("../models/calendarEvent.model");

/**
 * Compute Manager/Admin dashboard stats.
 * Online users = sessions that are not revoked with lastActiveAt within last 5 minutes.
 */
async function getManagerStats(user) {
  const isAdmin = user.role === "admin";

  // For admin: across whole org. For manager: restrict to their department (if any) or direct reports.
  const userFilter = {};
  if (!isAdmin) {
    if (user.department) {
      userFilter.department = user.department;
    } else {
      // Managers without a department see their direct reports (reportsTo = self) + themselves
      userFilter.$or = [{ _id: user._id }, { reportsTo: user._id }];
    }
  }

  const onlineSince = new Date(Date.now() - 5 * 60 * 1000);

  const [totalEmployees, onlineSessions, activeProjects, pendingTasks, taskByStatus, projectByStatus, recentUsers] =
    await Promise.all([
      // Total employees (not admins/managers unless admin)
      isAdmin ? User.countDocuments({ role: "employee" }) : User.countDocuments({ ...userFilter, role: "employee" }),

      // Online users: distinct non-revoked sessions active in last 5 min
      Session.distinct("user", { isRevoked: false, lastActiveAt: { $gte: onlineSince } }),

      // Active projects
      isAdmin
        ? Project.countDocuments({ status: "active" })
        : Project.countDocuments({ status: "active", $or: [{ owner: user._id }, { members: user._id }] }),

      // Pending tasks
      isAdmin
        ? Task.countDocuments({ status: { $in: ["pending", "in_progress"] } })
        : Task.countDocuments({
            status: { $in: ["pending", "in_progress"] },
            $or: [{ assignedTo: user._id }, { createdBy: user._id }, { department: user.department }],
          }),

      // Analytics: tasks grouped by status
      Task.aggregate([
        { $match: isAdmin ? {} : { $or: [{ assignedTo: user._id }, { createdBy: user._id }, { department: user.department }] } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Analytics: projects grouped by status
      Project.aggregate([
        { $match: isAdmin ? {} : { $or: [{ owner: user._id }, { members: user._id }] } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Recent employee list (for "Total Employees" breakdown / team)
      isAdmin
        ? User.find({ role: "employee" }).populate("department", "name").sort({ createdAt: -1 }).limit(8)
        : User.find({ ...userFilter, role: "employee" }).populate("department", "name").sort({ createdAt: -1 }).limit(8),
    ]);

  // Normalise analytics into {label, value}
  const taskStatusMap = { pending: 0, in_progress: 0, completed: 0 };
  taskByStatus.forEach((t) => {
    if (taskStatusMap[t._id] !== undefined) taskStatusMap[t._id] = t.count;
  });

  const projectStatusMap = { active: 0, completed: 0, on_hold: 0, cancelled: 0 };
  projectByStatus.forEach((p) => {
    if (projectStatusMap[p._id] !== undefined) projectStatusMap[p._id] = p.count;
  });

  return {
    stats: {
      totalEmployees,
      onlineUsers: onlineSessions.length,
      activeProjects,
      pendingTasks,
    },
    analytics: {
      tasksByStatus: [
        { label: "Pending", value: taskStatusMap.pending },
        { label: "In Progress", value: taskStatusMap.in_progress },
        { label: "Completed", value: taskStatusMap.completed },
      ],
      projectsByStatus: [
        { label: "Active", value: projectStatusMap.active },
        { label: "On Hold", value: projectStatusMap.on_hold },
        { label: "Completed", value: projectStatusMap.completed },
        { label: "Cancelled", value: projectStatusMap.cancelled },
      ],
    },
    team: recentUsers,
  };
}

/**
 * Compute Employee dashboard data.
 */
async function getEmployeeStats(user) {
  const [tasks, notifications, activity, events] = await Promise.all([
    Task.find({ assignedTo: user._id })
      .populate("project", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(10),

    Notification.find({ user: user._id }).sort({ createdAt: -1 }).limit(10),

    ActivityLog.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10),

    CalendarEvent.find({ user: user._id }).sort({ date: 1 }),
  ]);

  const unreadCount = await Notification.countDocuments({ user: user._id, isRead: false });

  return {
    tasks,
    notifications,
    activity,
    calendarEvents: events,
    unreadCount,
  };
}

module.exports = { getManagerStats, getEmployeeStats };
