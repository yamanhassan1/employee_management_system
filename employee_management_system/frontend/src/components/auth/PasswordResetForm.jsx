import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import PasswordInput from '../common/PasswordInput'

export default function PasswordResetForm({ mode = 'forgot' }) {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [msg, setMsg] = useState(null)
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)
  const auth = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    setMsg(null)
    setIsError(false)
    setLoading(true)

    try {
      if (mode === 'forgot') {
        // Client validation
        if (!email.trim()) {
          setIsError(true)
          setMsg('Email is required')
          setLoading(false)
          return
        }

        await auth.forgotPassword({ email })
        setIsError(false)
        setMsg('If that email is registered, a reset link has been sent. Check your inbox.')
        setEmail('')
      } else {
        // Reset password validation
        if (!token.trim()) {
          setIsError(true)
          setMsg('Reset token is required')
          setLoading(false)
          return
        }
        if (!newPassword) {
          setIsError(true)
          setMsg('New password is required')
          setLoading(false)
          return
        }
        if (newPassword.length < 8) {
          setIsError(true)
          setMsg('Password must be at least 8 characters')
          setLoading(false)
          return
        }
        if (newPassword !== confirmPassword) {
          setIsError(true)
          setMsg('Passwords do not match')
          setLoading(false)
          return
        }

        await auth.resetPassword({ token, newPassword })
        setIsError(false)
        setMsg('Password reset successful. Redirecting to login...')
        setTimeout(() => (window.location.href = '/auth/login'), 2000)
      }
    } catch (err) {
      setIsError(true)
      const message = err?.response?.data?.message

      if (message?.includes('invalid') || message?.includes('expired')) {
        setMsg(`${message} Please request a new reset link.`)
      } else {
        setMsg(message || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="auth-form">
      <div className="auth-brand-header">
        <img src="/favicon.svg" alt="logo" className="auth-brand-logo" />
        <h2>{mode === 'forgot' ? 'Forgot Password' : 'Reset Password'}</h2>
        <p className="auth-brand-sub">
          {mode === 'forgot'
            ? 'Enter your email to receive a reset link'
            : 'Enter a new password for your account'}
        </p>
      </div>
      {msg && <div className={isError ? 'form-error' : 'form-msg'}>{msg}</div>}

      {mode === 'forgot' ? (
        <div className="form-group">
          <label htmlFor="reset-email">Email</label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={loading}
            placeholder="you@example.com"
          />
        </div>
      ) : (
        <>
          <div className="form-group">
            <label htmlFor="reset-token">Reset Token</label>
            <input
              id="reset-token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              disabled={loading}
              placeholder="Paste your reset token"
            />
            <small className="form-hint">Check your email for the reset link</small>
          </div>

          <PasswordInput
            id="reset-new-password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            disabled={loading}
            hint="At least 8 characters"
          />

          <PasswordInput
            id="reset-confirm-password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            disabled={loading}
          />
        </>
      )}

      <button type="submit" className="btn primary" disabled={loading}>
        {loading ? 'Submitting…' : 'Submit'}
      </button>

      <div className="form-links">
        <Link to="/auth/login">Back to login</Link>
      </div>
    </form>
  )
}
