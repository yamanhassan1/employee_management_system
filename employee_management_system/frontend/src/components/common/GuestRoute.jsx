import { Navigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import Loader from './Loader'
import { getDashboardRoute } from '../../utils/navigation'

/**
 * Protects auth-only pages (login, register, forgot/reset password, verify email).
 * - While the session is being restored (on refresh), show a loader.
 * - If already authenticated, redirect to the user's role dashboard so they
 *   are never shown a login/register/forgot-password page.
 */
export default function GuestRoute({ children }) {
  const auth = useAuth()
  const { user, loading } = auth || {}

  // Wait for the auth restore to finish (refresh) before deciding.
  if (loading) {
    return <Loader />
  }

  // Already logged in => go to dashboard, never show auth pages.
  if (user) {
    return <Navigate to={getDashboardRoute(user.role)} replace />
  }

return children
}
