import { useState } from 'react'
import Navbar from '../../components/common/Navbar'
import useAuth from '../../hooks/useAuth'
import { ROLE_NAMES } from '../../utils/constants'

export default function UserProfile() {
  const { user, updateMyProfile } = useAuth()

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [error, setError] = useState(null)

  const managerName = user?.reportsTo?.name || user?.reportsTo || null
  const departmentName = user?.department?.name || user?.department || null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    setError(null)

    const payload = { name, email, jobTitle }
    if (newPassword) {
      payload.currentPassword = currentPassword
      payload.newPassword = newPassword
    }

    try {
      await updateMyProfile(payload)
      setMsg('Profile updated successfully')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <Navbar />
      <main className="page-main">
        <div className="dashboard-wrapper">
          <div className="dashboard-card">
            <div className="dashboard-brand-header">
              <img src="/favicon.svg" alt="logo" className="dashboard-brand-logo" />
              <div>
                <h2>My Profile</h2>
                <p className="dashboard-brand-sub">Update your name, email, password, and job title</p>
              </div>
            </div>

            {msg && <div className="form-msg">{msg}</div>}
            {error && <div className="form-error">{error}</div>}

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
                <small className="form-hint">If you change your email, you will need to verify the new address.</small>
              </div>

              <div className="form-group">
                <label htmlFor="jobTitle">Job Title</label>
                <input
                  id="jobTitle"
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Software Engineer"
                />
                <small className="form-hint">Shown to your manager and team</small>
              </div>

              <div className="form-group">
                <label>Role</label>
                <input value={ROLE_NAMES[user?.role] || user?.role || ''} disabled />
              </div>

              <div className="form-group">
                <label>Department</label>
                <input value={departmentName || '—'} disabled />
              </div>

              <div className="form-group">
                <label>Manager</label>
                <input value={managerName || '—'} disabled />
              </div>

              <hr className="profile-divider" />

              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Required to change password"
                  autoComplete="current-password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  autoComplete="new-password"
                />
                <small className="form-hint">At least 6 characters. Leave blank if you do not want to change it.</small>
              </div>

              <button type="submit" className="btn primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
</main>
    </div>
  )
}
