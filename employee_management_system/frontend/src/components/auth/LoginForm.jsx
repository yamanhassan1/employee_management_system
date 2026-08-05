import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { getDashboardRoute } from '../../utils/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const auth = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Client-side validation
    if (!email.trim()) {
      setError('Email is required')
      setLoading(false)
      return
    }
    if (!password) {
      setError('Password is required')
      setLoading(false)
      return
    }

    try {
      let deviceId = localStorage.getItem('deviceId')
      if (!deviceId) {
        deviceId = crypto?.randomUUID?.() || Math.random().toString(36).slice(2)
        localStorage.setItem('deviceId', deviceId)
      }

      const res = await auth.login({ email, password, deviceId })
      const nextRoute = getDashboardRoute(res?.data?.role)
      navigate(nextRoute)
    } catch (err) {
      const message = err?.response?.data?.message
      
      // Handle specific backend errors
      if (message?.includes('Account locked')) {
        setError(`${message} Please try again after some time.`)
      } else if (message?.includes('Please verify your email')) {
        setError(`${message} Check your email for the verification link.`)
      } else if (message?.includes('Invalid email or password')) {
        setError('Invalid email or password. Please check and try again.')
      } else {
        setError(message || 'Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="auth-form">
      <h2>Login</h2>
      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          autoComplete="email"
          disabled={loading}
          placeholder="you@example.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          autoComplete="current-password"
          disabled={loading}
          placeholder="••••••••"
        />
      </div>

      <button type="submit" className="btn primary" disabled={loading}>
        {loading ? 'Logging in…' : 'Login'}
      </button>

    </form>
  )
}