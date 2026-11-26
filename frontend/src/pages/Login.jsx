import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Login() {
  const location = useLocation()
  const navigate = useNavigate()
  const { loginWithToken, user } = useAuth()
  const [mode, setMode] = useState('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  useEffect(() => {
    const token = new URLSearchParams(location.search).get('token')
    if (token) loginWithToken(token).then(authenticated => navigate(authenticated.profile_complete ? '/dashboard' : '/complete-profile', { replace: true })).catch(() => setError('Google sign-in failed. Please try again.'))
  }, [location.search])
  useEffect(() => { if (user) navigate(user.profile_complete ? '/dashboard' : '/complete-profile', { replace: true }) }, [user])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login'
      const payload = mode === 'register' ? { full_name: fullName, email, password } : { email, password }
      const { data } = await api.post(endpoint, payload)
      const authenticated = await loginWithToken(data.access_token)
      navigate(authenticated.profile_complete ? '/dashboard' : '/complete-profile')
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(Array.isArray(detail) ? detail.map(item => item.msg).join(' ') : detail || 'Could not connect. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return <main className="login-page">
    <section className="login-shell">
      <aside className="login-welcome">
        <img className="login-welcome-logo" src="/nemsu-docs-mark.svg" alt="" />
        <div className="login-welcome-copy">
          <p className="login-welcome-kicker">North Eastern Mindanao State University</p>
          <h1>Hello,<br /><span>NEMSU Docs</span></h1>
          <p>Request official school documents and keep track of every step, all in one place.</p>
        </div>
        <footer>© {new Date().getFullYear()} NEMSU Docs · Document Request and Tracking System</footer>
      </aside>

      <section className="login-panel">
        <div className="login-panel-inner">
          <div className="login-brandline"><img src="/nemsu-docs-mark.svg" alt="" /><span>NEMSU Docs</span></div>
          <div className="login-intro">
            <h2>{mode === 'register' ? 'Create your account' : 'Welcome back!'}</h2>
            <p>{mode === 'register' ? 'Register to start managing your document requests.' : 'Sign in to manage and track your document requests.'}</p>
            <p className="login-account-switch">
              {mode === 'register' ? 'Already have an account?' : "Don’t have an account?"}{' '}
              <button type="button" onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError('') }}>
                {mode === 'register' ? 'Sign in' : 'Create a new account'}
              </button>
            </p>
          </div>

          {error && <div className="alert error" role="alert">{error}</div>}
          <form className="login-form login-split-form" onSubmit={handleSubmit}>
            {mode === 'register' && <label>Full name<input autoComplete="name" required minLength="2" maxLength="120" value={fullName} onChange={e => setFullName(e.target.value)} /></label>}
            <label>Email address<input type="email" autoComplete="email" required maxLength="254" value={email} onChange={e => setEmail(e.target.value)} /></label>
            <label>Password<input type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} required minLength={mode === 'register' ? 8 : 1} maxLength="128" value={password} onChange={e => setPassword(e.target.value)} />{mode === 'register' && <small>Use at least 8 characters.</small>}</label>
            <button className="primary-button login-submit" type="submit" disabled={submitting}>{submitting ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in with email'}</button>
          </form>
          <div className="login-divider"><span>or continue with</span></div>
          <a className="google-button" href={`${apiUrl}/api/auth/google`}><span className="google-g">G</span> Continue with Google</a>
        </div>
      </section>
    </section>
  </main>
}
