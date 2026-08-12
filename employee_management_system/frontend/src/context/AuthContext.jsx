import { createContext, useContext, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import api from '../lib/api'
import {
  setUser,
  setAuthStatus,
  clearAuth,
  selectUser,
  selectAuthLoading,
} from '../features/auth/authSlice'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const loading = useSelector(selectAuthLoading)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      dispatch(setAuthStatus('loading'))
      try {
        await api.refresh()
        const res = await api.me()
        if (mounted) dispatch(setUser(res?.data || null))
      } catch {
        if (mounted) dispatch(clearAuth())
      }
    })()
    return () => { mounted = false }
  }, [dispatch])

  const withLoading = async (fn) => {
    dispatch(setAuthStatus('loading'))
    try {
      const result = await fn()
      dispatch(setAuthStatus(user ? 'authenticated' : 'idle'))
      return result
    } catch (err) {
      dispatch(setAuthStatus(user ? 'authenticated' : 'unauthenticated'))
      throw err
    }
  }

  const register = (payload) => withLoading(() => api.register(payload))

  const login = async (payload) => {
    dispatch(setAuthStatus('loading'))
    try {
      const res = await api.login(payload)
      dispatch(setUser(res?.data || null))
      return res
    } catch (err) {
      dispatch(setAuthStatus('unauthenticated'))
      throw err
    }
  }

  const logout = async () => {
    await api.logout()
    dispatch(clearAuth())
  }

  const getMe = async () => {
    const res = await api.me()
    dispatch(setUser(res?.data || null))
    return res
  }

  const updateMyProfile = async (payload) => {
    const res = await api.updateMyProfile(payload)
    dispatch(setUser(res?.data || null))
    return res
  }

  const value = {
    user,
    setUser: (u) => dispatch(setUser(u)),
    loading,
    register,
    login,
    logout,
    forgotPassword: (payload) => api.forgotPassword(payload),
    resetPassword: (payload) => api.resetPassword(payload),
    verifyEmail: (payload) => api.verifyEmail(payload),
    getSessions: async () => {
      const res = await api.getSessions()
      return res?.data || []
    },
    revokeSession: (sessionId) => api.revokeSession(sessionId),
    getMe,
    updateMyProfile,
    listUsers: async () => {
      const res = await api.listUsers()
      return res?.data || []
    },
    getUser: (id) => api.getUser(id),
    updateUserRole: (id, payload) => api.updateUserRole(id, payload),
    updateUserManager: (id, payload) => api.updateUserManager(id, payload),
    updateUserDepartment: (id, payload) => api.updateUserDepartment(id, payload),
    listDepartments: async () => {
      const res = await api.listDepartments()
      return res?.data || []
    },
    createDepartment: (payload) => api.createDepartment(payload),
    updateDepartment: (id, payload) => api.updateDepartment(id, payload),
    deleteDepartment: (id) => api.deleteDepartment(id),
    getManagerDashboard: async () => {
      const res = await api.getManagerDashboard()
      return res?.data || null
    },
    getEmployeeDashboard: async () => {
      const res = await api.getEmployeeDashboard()
      return res?.data || null
    },
    listProjects: async () => {
      const res = await api.listProjects()
      return res?.data || []
    },
    getProject: async (id) => {
      const res = await api.getProject(id)
      return res?.data || null
    },
    createProject: (payload) => api.createProject(payload),
    updateProject: (id, payload) => api.updateProject(id, payload),
    deleteProject: (id) => api.deleteProject(id),
    createTaskList: (projectId, payload) => api.createTaskList(projectId, payload),
    updateTaskList: (listId, payload) => api.updateTaskList(listId, payload),
    deleteTaskList: (listId) => api.deleteTaskList(listId),
    listTasks: async () => {
      const res = await api.listTasks()
      return res?.data || []
    },
    getTask: async (taskId) => {
      const res = await api.getTask(taskId)
      return res?.data || null
    },
    createTask: (projectId, payload) => api.createTask(projectId, payload),
    updateTask: (taskId, payload) => api.updateTask(taskId, payload),
    moveTask: (taskId, payload) => api.moveTask(taskId, payload),
    deleteTask: (taskId) => api.deleteTask(taskId),
    createSubtask: (taskId, payload) => api.createSubtask(taskId, payload),
    updateSubtask: (subtaskId, payload) => api.updateSubtask(subtaskId, payload),
    deleteSubtask: (subtaskId) => api.deleteSubtask(subtaskId),
    createLabel: (projectId, payload) => api.createLabel(projectId, payload),
    deleteLabel: (labelId) => api.deleteLabel(labelId),
    createComment: (taskId, payload) => api.createComment(taskId, payload),
    deleteComment: (commentId) => api.deleteComment(commentId),
    createAttachment: (taskId, payload) => api.createAttachment(taskId, payload),
    deleteAttachment: (attachmentId) => api.deleteAttachment(attachmentId),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext

export const useAuthContext = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
