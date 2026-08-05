import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { ROLES } from '../../utils/constants'

export default function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('employee')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const auth = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Client-side validation
    if (!name.trim()) {
      setError('Name is required')
      setLoading(false)
      return
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters')
      setLoading(false)
      return
    }
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
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      await auth.register({ name, email, password, role })
      navigate('/auth/login', { state: { registered: true } })
    } catch (err) {
      const message = err?.response?.data?.message
      
      if (message?.includes('already registered')) {
        setError('This email is already registered. Please login or reset your password.')
      } else {
        setError(message || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="auth-form">
      <h2>Register</h2>
      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="register-name">Name</label>
        <input
          id="register-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          disabled={loading}
          placeholder="John Doe"
        />
      </div>

      <div className="form-group">
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
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
        <label htmlFor="register-role">Role</label>
        <select
          id="register-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={loading}
        >
          {ROLES.map((roleOption) => (
            <option key={roleOption} value={roleOption}>
              {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          disabled={loading}
          placeholder="••••••••"
        />
        <small className="form-hint">At least 8 characters</small>
      </div>

      <div className="form-group">
        <label htmlFor="register-confirm-password">Confirm Password</label>
        <input
          id="register-confirm-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          disabled={loading}
          placeholder="••••••••"
        />
      </div>

      <button type="submit" className="btn primary" disabled={loading}>
        {loading ? 'Registering…' : 'Register'}
      </button>

    </form>
  )
}