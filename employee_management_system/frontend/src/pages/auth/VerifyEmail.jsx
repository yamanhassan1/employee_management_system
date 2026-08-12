import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import AuthPage from '../../components/auth/AuthPage'
import useAuth from '../../hooks/useAuth'

export default function VerifyEmail() {
  const [token, setToken] = useState('')
  const [msg, setMsg] = useState(null)
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const auth = useAuth()
  const autoSubmitted = useRef(false)

  const doVerify = async (rawToken) => {
    setLoading(true)
    setMsg(null)
    setIsError(false)
    try {
      await auth.verifyEmail({ token: rawToken })
      setIsError(false)
      setMsg('Email verified successfully! Redirecting to login...')
      setTimeout(() => navigate('/auth/login'), 2000)
    } catch (err) {
      setIsError(true)
      setMsg(err?.response?.data?.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-submit verification when a token is present in the URL query string
  useEffect(() => {
    const urlToken = searchParams.get('token')
    if (urlToken && !autoSubmitted.current) {
      autoSubmitted.current = true
      setToken(urlToken)
      doVerify(urlToken)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const submit = async (e) => {
    e.preventDefault()
    if (!token.trim()) {
      setIsError(true)
      setMsg('Please enter a verification token')
      return
    }
    doVerify(token)
  }

  return (
    <AuthPage footerLinks={[{ to: '/auth/login', label: 'Already verified? Login here' }]}>
      <form onSubmit={submit} className="auth-form">
        <h2>Verify Email</h2>
        <p className="form-subtitle">Enter the verification token sent to your email</p>

        {msg && (
          <div className={isError ? 'form-error' : 'form-msg'}>
            {msg}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="verify-token">Verification Token</label>
          <input
            id="verify-token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your verification token"
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? 'Verifying…' : 'Verify Email'}
        </button>
      </form>
    </AuthPage>
  )
}
