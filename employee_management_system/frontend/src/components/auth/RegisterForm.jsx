import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import PasswordInput from '../common/PasswordInput'

export default function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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
      await auth.register({ name, email, password, confirmPassword })
      navigate('/auth/login', { state: { registered: true } })
    } catch (err) {
      const message = err?.response?.data?.message

      if (message?.includes('already registered')) {
        setError('This email is already registered. Please login or reset your password.')
      } else if (message?.includes('Passwords do not match')) {
        setError('Passwords do not match. Please re-enter your password.')
      } else {
        setError(message || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="auth-form">
      <div className="auth-brand-header">
        <img src="/favicon.svg" alt="logo" className="auth-brand-logo" />
        <h2>Create Account</h2>
        <p className="auth-brand-sub">Join the Employee Management System</p>
      </div>
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

      <PasswordInput
        id="register-password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        autoComplete="new-password"
        disabled={loading}
        hint="At least 8 characters"
      />

      <PasswordInput
        id="register-confirm-password"
        label="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        minLength={8}
        autoComplete="new-password"
        disabled={loading}
        hint="Re-enter your password"
      />

      <button type="submit" className="btn primary" disabled={loading}>
        {loading ? 'Registering…' : 'Register'}
      </button>
    </form>
  )
}
