import apiClient from './axios'
import { API_ENDPOINTS } from '../utils/constants'

const unwrap = (res) => res.data

export const api = {
  register: (payload) => apiClient.post(API_ENDPOINTS.AUTH_REGISTER, payload).then(unwrap),
  login: (payload) => apiClient.post(API_ENDPOINTS.AUTH_LOGIN, payload).then(unwrap),
  refresh: () => apiClient.post(API_ENDPOINTS.AUTH_REFRESH).then(unwrap),
  me: () => apiClient.get(API_ENDPOINTS.AUTH_ME).then(unwrap),
  updateMyProfile: (payload) => apiClient.patch(API_ENDPOINTS.AUTH_ME_UPDATE, payload).then(unwrap),
  logout: () => apiClient.post(API_ENDPOINTS.AUTH_LOGOUT).then(unwrap),
  logoutAll: () => apiClient.post(API_ENDPOINTS.AUTH_LOGOUT_ALL).then(unwrap),
  forgotPassword: (payload) => apiClient.post(API_ENDPOINTS.PASSWORD_FORGOT, payload).then(unwrap),
  resetPassword: (payload) => apiClient.post(API_ENDPOINTS.PASSWORD_RESET, payload).then(unwrap),
  verifyEmail: (payload) => apiClient.post(API_ENDPOINTS.EMAIL_VERIFY, payload).then(unwrap),
  resendVerification: (payload) => apiClient.post(API_ENDPOINTS.EMAIL_RESEND, payload).then(unwrap),
  getSessions: () => apiClient.get(API_ENDPOINTS.SESSIONS_GET).then(unwrap),
  revokeSession: (sessionId) => apiClient.delete(API_ENDPOINTS.SESSIONS_REVOKE(sessionId)).then(unwrap),

  listUsers: () => apiClient.get(API_ENDPOINTS.USERS_GET).then(unwrap),
  getUser: (id) => apiClient.get(API_ENDPOINTS.USERS_GET_ONE(id)).then(unwrap),
  updateUserRole: (id, payload) => apiClient.patch(API_ENDPOINTS.USERS_UPDATE_ROLE(id), payload).then(unwrap),
  updateUserManager: (id, payload) => apiClient.patch(API_ENDPOINTS.USERS_UPDATE_MANAGER(id), payload).then(unwrap),
  updateUserDepartment: (id, payload) => apiClient.patch(API_ENDPOINTS.USERS_UPDATE_DEPARTMENT(id), payload).then(unwrap),

  listDepartments: () => apiClient.get(API_ENDPOINTS.DEPARTMENTS_GET).then(unwrap),
  createDepartment: (payload) => apiClient.post(API_ENDPOINTS.DEPARTMENTS_CREATE, payload).then(unwrap),
  updateDepartment: (id, payload) => apiClient.patch(API_ENDPOINTS.DEPARTMENTS_UPDATE(id), payload).then(unwrap),
  deleteDepartment: (id) => apiClient.delete(API_ENDPOINTS.DEPARTMENTS_DELETE(id)).then(unwrap),

  getManagerDashboard: () => apiClient.get(API_ENDPOINTS.DASHBOARD_MANAGER).then(unwrap),
  getEmployeeDashboard: () => apiClient.get(API_ENDPOINTS.DASHBOARD_EMPLOYEE).then(unwrap),

  listProjects: () => apiClient.get(API_ENDPOINTS.PROJECTS).then(unwrap),
  getProject: (id) => apiClient.get(API_ENDPOINTS.PROJECT_GET(id)).then(unwrap),
  createProject: (payload) => apiClient.post(API_ENDPOINTS.PROJECTS, payload).then(unwrap),
  updateProject: (id, payload) => apiClient.patch(API_ENDPOINTS.PROJECT_UPDATE(id), payload).then(unwrap),
  deleteProject: (id) => apiClient.delete(API_ENDPOINTS.PROJECT_DELETE(id)).then(unwrap),

  createTaskList: (projectId, payload) => apiClient.post(API_ENDPOINTS.PROJECT_LISTS(projectId), payload).then(unwrap),
  updateTaskList: (listId, payload) => apiClient.patch(API_ENDPOINTS.TASK_LIST_UPDATE(listId), payload).then(unwrap),
  deleteTaskList: (listId) => apiClient.delete(API_ENDPOINTS.TASK_LIST_DELETE(listId)).then(unwrap),

  listTasks: () => apiClient.get(API_ENDPOINTS.TASKS).then(unwrap),
  getTask: (taskId) => apiClient.get(API_ENDPOINTS.TASK_GET(taskId)).then(unwrap),
  createTask: (projectId, payload) => apiClient.post(API_ENDPOINTS.PROJECT_TASKS(projectId), payload).then(unwrap),
  updateTask: (taskId, payload) => apiClient.patch(API_ENDPOINTS.TASK_UPDATE(taskId), payload).then(unwrap),
  moveTask: (taskId, payload) => apiClient.patch(API_ENDPOINTS.TASK_MOVE(taskId), payload).then(unwrap),
  deleteTask: (taskId) => apiClient.delete(API_ENDPOINTS.TASK_DELETE(taskId)).then(unwrap),

  createSubtask: (taskId, payload) => apiClient.post(API_ENDPOINTS.TASK_SUBTASKS(taskId), payload).then(unwrap),
  updateSubtask: (subtaskId, payload) => apiClient.patch(API_ENDPOINTS.SUBTASK_UPDATE(subtaskId), payload).then(unwrap),
  deleteSubtask: (subtaskId) => apiClient.delete(API_ENDPOINTS.SUBTASK_DELETE(subtaskId)).then(unwrap),

  createLabel: (projectId, payload) => apiClient.post(API_ENDPOINTS.PROJECT_LABELS(projectId), payload).then(unwrap),
  deleteLabel: (labelId) => apiClient.delete(API_ENDPOINTS.LABEL_DELETE(labelId)).then(unwrap),

  createComment: (taskId, payload) => apiClient.post(API_ENDPOINTS.TASK_COMMENTS(taskId), payload).then(unwrap),
  deleteComment: (commentId) => apiClient.delete(API_ENDPOINTS.COMMENT_DELETE(commentId)).then(unwrap),

  createAttachment: (taskId, payload) => apiClient.post(API_ENDPOINTS.TASK_ATTACHMENTS(taskId), payload).then(unwrap),
  deleteAttachment: (attachmentId) => apiClient.delete(API_ENDPOINTS.ATTACHMENT_DELETE(attachmentId)).then(unwrap),

  listNotifications: (params) => apiClient.get('/notifications', { params }).then(unwrap),
  markNotificationRead: (id) => apiClient.patch(`/notifications/${id}/read`).then(unwrap),
  markAllNotificationsRead: () => apiClient.patch('/notifications/read-all').then(unwrap),

  listCalendarEvents: (params) => apiClient.get('/calendar', { params }).then(unwrap),
  createCalendarEvent: (payload) => apiClient.post('/calendar', payload).then(unwrap),
  updateCalendarEvent: (id, payload) => apiClient.patch(`/calendar/${id}`, payload).then(unwrap),
  deleteCalendarEvent: (id) => apiClient.delete(`/calendar/${id}`).then(unwrap),
}

export default api
