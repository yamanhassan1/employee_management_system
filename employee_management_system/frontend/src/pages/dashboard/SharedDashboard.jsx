import { useState, useEffect } from 'react'
import Navbar from '../../components/common/Navbar'
import useAuth from '../../hooks/useAuth'

export default function SharedDashboard({
  title,
  badgeClass,
  actionTitle,
  actionDescription,
  actionButtons = [],
}) {
  const { user, logout, getSessions, revokeSession } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSessions()
  }, [])

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

  const handleRevokeSession = async (sessionId) => {
    try {
      await revokeSession(sessionId)
      setSessions(sessions.filter((s) => s._id !== sessionId))
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to revoke session')
    }
  }

  return (
    <div className="page-container">
      <Navbar />
      <main className="page-main">
        <div className="dashboard-wrapper">
          <div className="dashboard-card">
            <h2>{title}</h2>
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
                <span className={`info-badge ${badgeClass}`}>{user?.role}</span>
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
