export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/v1'

export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT_ALL: '/auth/logout-all',

  // Email verification
  EMAIL_VERIFY: '/email/verify',
  EMAIL_RESEND: '/email/resend',

  // Password reset
  PASSWORD_FORGOT: '/password/forgot',
  PASSWORD_RESET: '/password/reset',

  // Sessions
  SESSIONS_GET: '/sessions',
  SESSIONS_REVOKE: (sessionId) => `/sessions/${sessionId}`,
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
