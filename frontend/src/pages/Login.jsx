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
            {mode === 'register' && <label>Full name<input autoComplete="name" placeholder="Your full name" required minLength="2" maxLength="120" value={fullName} onChange={e => setFullName(e.target.value)} /></label>}
            <label>Email address<input type="email" autoComplete="email" placeholder="name@example.com" required maxLength="254" value={email} onChange={e => setEmail(e.target.value)} /></label>
            <label>Password<input type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} placeholder={mode === 'register' ? 'Create a password' : 'Enter your password'} required minLength={mode === 'register' ? 8 : 1} maxLength="128" value={password} onChange={e => setPassword(e.target.value)} />{mode === 'register' && <small>Use at least 8 characters.</small>}</label>
            <button className="primary-button login-submit" type="submit" disabled={submitting}>{submitting ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in with email'}</button>
          </form>
          <div className="login-divider"><span>or continue with</span></div>
          <a className="google-button" href={`${apiUrl}/api/auth/google`}><svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v2.96h3.87c2.27-2.09 3.57-5.16 3.57-8.6Z"/><path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.93l-3.87-2.96c-1.08.73-2.46 1.16-4.08 1.16-3.14 0-5.8-2.12-6.75-4.96H1.25v3.05A12 12 0 0 0 12 24Z"/><path fill="#FBBC05" d="M5.25 14.31a7.2 7.2 0 0 1 0-4.62V6.64H1.25a12 12 0 0 0 0 10.72l4-3.05Z"/><path fill="#EA4335" d="M12 4.73c1.76 0 3.34.6 4.59 1.8l3.44-3.44C17.95 1.14 15.24 0 12 0A12 12 0 0 0 1.25 6.64l4 3.05C6.2 6.85 8.86 4.73 12 4.73Z"/></svg> Continue with Google</a>
        </div>
      </section>
    </section>
  </main>
}
