import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { useState } from 'react'

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
          AuthSystem
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
              <Link to="/auth/forgot-password">Settings</Link>
            </>
          )}
        </div>

        <div className="nav-user">
          {!auth?.user ? (
            <span className="text-muted">Not logged in</span>
          ) : (
            <>
              <div>
                <div className="nav-user-name">{auth.user.name || auth.user.email}</div>
                {auth.user?.role && (
                  <div className="nav-user-role">{auth.user.role}</div>
                )}
              </div>
              <button
                className="btn small danger"
                onClick={handleLogout}
                disabled={loading}
              >
                {loading ? '...' : 'Logout'}
              </button>
              {error && <span className="text-error" style={{ fontSize: '0.75rem' }}>{error}</span>}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}