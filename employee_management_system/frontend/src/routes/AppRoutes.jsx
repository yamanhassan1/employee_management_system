import { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/common/ProtectedRoute'
import RoleBasedRoute from '../components/common/RoleBasedRoute'
import GuestRoute from '../components/common/GuestRoute'
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
const UserProfile = lazy(() => import('../pages/dashboard/UserProfile'))
const ProjectsPage = lazy(() => import('../pages/projects/ProjectsPage'))
const ProjectBoard = lazy(() => import('../pages/projects/ProjectBoard'))

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
{/* Auth routes — Guests only; already-authenticated users are redirected to their dashboard */}
      <Route
        path="/auth/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/auth/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />
      <Route
        path="/auth/forgot-password"
        element={
          <GuestRoute>
            <ForgotPassword />
          </GuestRoute>
        }
      />
      <Route
        path="/auth/reset-password"
        element={
          <GuestRoute>
            <ResetPassword />
          </GuestRoute>
        }
      />
      <Route
        path="/auth/verify-email"
        element={
          <GuestRoute>
            <VerifyEmail />
          </GuestRoute>
        }
      />
      {/* Alias for backward compatibility with older email links */}
      <Route
        path="/verify-email"
        element={
          <GuestRoute>
            <VerifyEmail />
          </GuestRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <GuestRoute>
            <ResetPassword />
          </GuestRoute>
        }
      />

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

{/* User self-service profile (any authenticated user) */}
      <Route
        path="/dashboard/profile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />

{/* Generic dashboard - redirects to role-specific */}
      <Route path="/dashboard" element={<DashboardRedirect />} />

      {/* Project Management */}
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <ProjectBoard />
          </ProtectedRoute>
        }
      />

      {/* Home redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}