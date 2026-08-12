// Use the Vite dev proxy (same-origin) by default so cookies work without CORS issues.
// The proxy forwards /api/v1 to http://localhost:5000 (see vite.config.js).
// Override with VITE_API_BASE if you need to point at an absolute backend URL.
export const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1'

export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT_ALL: '/auth/logout-all',
AUTH_ME: '/auth/me',
  AUTH_ME_UPDATE: '/auth/me',

  // Users (admin)
  USERS_GET: '/users',
  USERS_GET_ONE: (id) => `/users/${id}`,
  USERS_UPDATE_ROLE: (id) => `/users/${id}/role`,
  USERS_UPDATE_MANAGER: (id) => `/users/${id}/manager`,
  USERS_UPDATE_DEPARTMENT: (id) => `/users/${id}/department`,

  // Departments
  DEPARTMENTS_GET: '/departments',
  DEPARTMENTS_CREATE: '/departments',
  DEPARTMENTS_UPDATE: (id) => `/departments/${id}`,
  DEPARTMENTS_DELETE: (id) => `/departments/${id}`,

  // Email verification
  EMAIL_VERIFY: '/email/verify',
  EMAIL_RESEND: '/email/resend',

  // Password reset
  PASSWORD_FORGOT: '/password/forgot',
  PASSWORD_RESET: '/password/reset',

// Sessions
  SESSIONS_GET: '/sessions',
  SESSIONS_REVOKE: (sessionId) => `/sessions/${sessionId}`,

// Dashboard
  DASHBOARD_MANAGER: '/dashboard/manager',
  DASHBOARD_EMPLOYEE: '/dashboard/employee',

  // Projects
  PROJECTS: '/projects',
  PROJECT_GET: (id) => `/projects/${id}`,
  PROJECT_UPDATE: (id) => `/projects/${id}`,
  PROJECT_DELETE: (id) => `/projects/${id}`,
  PROJECT_LISTS: (id) => `/projects/${id}/lists`,
  PROJECT_LABELS: (id) => `/projects/${id}/labels`,
  PROJECT_TASKS: (id) => `/projects/${id}/tasks`,
  TASK_LIST_UPDATE: (listId) => `/projects/task-lists/${listId}`,
  TASK_LIST_DELETE: (listId) => `/projects/task-lists/${listId}`,
  TASKS: '/projects/tasks',
TASK_GET: (taskId) => `/projects/tasks/${taskId}`,
  TASK_UPDATE: (taskId) => `/projects/tasks/${taskId}`,
  TASK_MOVE: (taskId) => `/projects/tasks/${taskId}/move`,
  TASK_DELETE: (taskId) => `/projects/tasks/${taskId}`,
  TASK_SUBTASKS: (taskId) => `/projects/tasks/${taskId}/subtasks`,
  SUBTASK_UPDATE: (subtaskId) => `/projects/subtasks/${subtaskId}`,
  SUBTASK_DELETE: (subtaskId) => `/projects/subtasks/${subtaskId}`,
  TASK_COMMENTS: (taskId) => `/projects/tasks/${taskId}/comments`,
  COMMENT_DELETE: (commentId) => `/projects/comments/${commentId}`,
  TASK_ATTACHMENTS: (taskId) => `/projects/tasks/${taskId}/attachments`,
  ATTACHMENT_DELETE: (attachmentId) => `/projects/attachments/${attachmentId}`,
  LABEL_DELETE: (labelId) => `/projects/labels/${labelId}`,

  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_READ: (id) => `/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: '/notifications/read-all',

  // Calendar
  CALENDAR: '/calendar',
  CALENDAR_EVENT: (id) => `/calendar/${id}`,
}

export const STORAGE_KEYS = {
  DEVICE_ID: 'deviceId',
  USER: 'user',
  ACCESS_TOKEN: 'accessToken',
}

export const TOKEN_CONFIG = {
  ACCESS_TOKEN_EXPIRY_MS: 15 * 60 * 1000, // 15 minutes
  REFRESH_TOKEN_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
}

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Something went wrong on the server. Please try again later.',
}

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  REGISTER_SUCCESS: 'Registration successful! Please verify your email.',
  EMAIL_VERIFIED: 'Email verified successfully.',
  PASSWORD_RESET: 'Password reset successful.',
}

export const ROLE_HIERARCHY = {
  admin: 3,
  manager: 2,
  employee: 1,
}

export const ROLE_NAMES = {
  admin: 'Administrator',
  manager: 'Manager',
  employee: 'Employee',
}

export const ROLE_DASHBOARD_ROUTE = {
  admin: '/dashboard/admin',
  manager: '/dashboard/manager',
  employee: '/dashboard/employee',
}

export const ROLES = ['admin', 'manager', 'employee']
