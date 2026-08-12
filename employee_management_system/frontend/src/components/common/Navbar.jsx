import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { useState } from 'react'
import { ROLE_NAMES } from '../../utils/constants'

export default function Navbar() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogout = async () => {
    try {
      setLoading(true)
      setError(null)
      await auth.logout()
      navigate('/auth/login')
    } catch (err) {
      setError(err?.response?.data?.message || 'Logout failed')
    } finally {
      setLoading(false)
    }
  }

  const getDashboardLink = () => {
    if (!auth?.user?.role) return '/dashboard'

    const roleLinks = {
      admin: '/dashboard/admin',
      manager: '/dashboard/manager',
      employee: '/dashboard/employee',
    }

    return roleLinks[auth.user.role] || '/dashboard'
  }

  return (
    <nav>
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <img src="/favicon.svg" alt="Employee Management System logo" className="nav-logo" />
          <div className="nav-brand-text">
            <span className="nav-brand-title">Employee Management</span>
            <span className="nav-brand-sub">System</span>
          </div>
        </Link>

        <div className="nav-links">
          {!auth?.user ? (
            <>
              <Link to="/auth/login">Login</Link>
              <Link to="/auth/register">Register</Link>
            </>
          ) : (
            <>
<Link to={getDashboardLink()}>Dashboard</Link>
              <Link to="/projects">Projects</Link>
              <Link to="/dashboard/profile">Profile</Link>
            </>
          )}
        </div>

        <div className="nav-user">
          {!auth?.user ? (
            <span className="text-muted">Not logged in</span>
          ) : (
            <>
              <div className="nav-user-info">
                <div className="nav-user-name">{auth.user.name || auth.user.email}</div>
                {auth.user?.role && (
                  <div className="nav-user-role">{ROLE_NAMES[auth.user.role] || auth.user.role}</div>
                )}
              </div>
              <button
                className="btn small danger"
                onClick={handleLogout}
                disabled={loading}
              >
                {loading ? '...' : 'Logout'}
              </button>
              {error && <span className="text-error nav-error">{error}</span>}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
