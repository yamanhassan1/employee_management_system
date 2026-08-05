import { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/common/ProtectedRoute'
import RoleBasedRoute from '../components/common/RoleBasedRoute'
import Loader from '../components/common/Loader'
import useAuth from '../hooks/useAuth'
import { getDashboardRoute } from '../utils/navigation'

const Login = lazy(() => import('../pages/auth/Login'))
const Register = lazy(() => import('../pages/auth/Register'))
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'))
const VerifyEmail = lazy(() => import('../pages/auth/VerifyEmail'))
const AdminDashboard = lazy(() => import('../pages/dashboard/AdminDashboard'))
const ManagerDashboard = lazy(() => import('../pages/dashboard/ManagerDashboard'))
const EmployeeDashboard = lazy(() => import('../pages/dashboard/EmployeeDashboard'))

function DashboardRedirect() {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loader />
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  return <Navigate to={getDashboardRoute(user.role)} replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      <Route path="/auth/verify-email" element={<VerifyEmail />} />

      {/* Dashboard routes - role-based */}
      <Route
        path="/dashboard/admin"
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/dashboard/manager"
        element={
          <RoleBasedRoute allowedRoles={['manager', 'admin']}>
            <ManagerDashboard />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/dashboard/employee"
        element={
          <RoleBasedRoute allowedRoles={['employee', 'manager', 'admin']}>
            <EmployeeDashboard />
          </RoleBasedRoute>
        }
      />

      {/* Generic dashboard - redirects to role-specific */}
      <Route path="/dashboard" element={<DashboardRedirect />} />

      {/* Home redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}