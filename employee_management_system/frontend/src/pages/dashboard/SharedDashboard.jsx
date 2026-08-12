import { useState, useEffect } from 'react'
import Navbar from '../../components/common/Navbar'
import useAuth from '../../hooks/useAuth'
import { ROLE_NAMES } from '../../utils/constants'

export default function SharedDashboard({
  title,
  badgeClass,
  actionTitle,
  actionDescription,
  actionButtons = [],
  children = null,
}) {
const { user, logout, getSessions, revokeSession } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const data = await getSessions()
      setSessions(data)
      setError(null)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const handleRevokeSession = async (sessionId) => {
    try {
      await revokeSession(sessionId)
      setSessions(sessions.filter((s) => s._id !== sessionId))
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to revoke session')
    }
  }

  const managerName = user?.reportsTo?.name || user?.reportsTo || null
  const departmentName = user?.department?.name || user?.department || null

  return (
    <div className="page-container">
      <Navbar />
      <main className="page-main">
        <div className="dashboard-wrapper">
<div className="dashboard-card">
            <div className="dashboard-brand-header">
              <img src="/favicon.svg" alt="logo" className="dashboard-brand-logo" />
              <div>
                <h2>{title}</h2>
                <p className="dashboard-brand-sub">Employee Management System</p>
              </div>
            </div>
            <div className="user-info">
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">{user?.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{user?.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Role:</span>
                <span className={`info-badge ${badgeClass}`}>{ROLE_NAMES[user?.role] || user?.role}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Job Title:</span>
                <span className="info-value">{user?.jobTitle || '—'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Department:</span>
                <span className="info-value">{departmentName || '—'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Manager:</span>
                <span className="info-value">{managerName || '—'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Last Login:</span>
                <span className="info-value">
                  {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'First login'}
                </span>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>Active Sessions</h3>
            {error && <div className="form-error">{error}</div>}
            {loading ? (
              <p className="text-muted">Loading sessions...</p>
            ) : sessions.length === 0 ? (
              <p className="text-muted">No active sessions</p>
            ) : (
              <div className="sessions-list">
                {sessions.map((session) => (
                  <div key={session._id} className="session-item">
                    <div className="session-info">
                      <p className="session-device">{session.userAgent?.substring(0, 50) || 'Unknown Device'}</p>
                      <p className="session-meta">
                        IP: {session.ip} • Last active: {new Date(session.lastActiveAt).toLocaleString()}
                      </p>
                    </div>
                    <button onClick={() => handleRevokeSession(session._id)} className="btn small danger">
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-card">
            <h3>{actionTitle}</h3>
            <div className="action-group">
              <p className="text-muted">{actionDescription}</p>
              {actionButtons.map((button, index) => (
                <button key={index} className="btn secondary" disabled={button.disabled}>
                  {button.label}
                </button>
              ))}
            </div>
          </div>

          {children}

          <div className="dashboard-card">
            <button onClick={logout} className="btn danger full-width">
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
