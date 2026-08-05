import { Navigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import Loader from './Loader'

export default function RoleBasedRoute({ children, allowedRoles = [] }) {
  const auth = useAuth()
  const { user, loading } = auth || {}

  if (loading) {
    return <Loader />
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}