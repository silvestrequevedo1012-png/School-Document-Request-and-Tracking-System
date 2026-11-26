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
    if (token) loginWithToken(token).then(() => navigate('/dashboard')).catch(() => setError('Google sign-in failed. Please try again.'))
  }, [location.search])
  useEffect(() => { if (user) navigate('/dashboard') }, [user])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login'
      const payload = mode === 'register' ? { full_name: fullName, email, password } : { email, password }
      const { data } = await api.post(endpoint, payload)
      await loginWithToken(data.access_token)
      navigate('/dashboard')
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(Array.isArray(detail) ? detail.map(item => item.msg).join(' ') : detail || 'Could not connect. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return <main className="login-page"><section className="login-card">
    <div className="brand-mark large">SD</div>
    <h1>School Document Request System</h1>
    <p>Sign in to manage your document requests.</p>
    <a className="google-button" href={`${apiUrl}/api/auth/google`}><span className="google-g">G</span> Continue with Google</a>
    <div className="login-divider"><span>or use your email</span></div>
    <div className="auth-tabs" role="tablist" aria-label="Account access">
      <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError('') }}>Sign in</button>
      <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError('') }}>Create account</button>
    </div>
    {error && <div className="alert error" role="alert">{error}</div>}
    <form className="login-form" onSubmit={handleSubmit}>
      {mode === 'register' && <label>Full name<input autoComplete="name" required minLength="2" maxLength="120" value={fullName} onChange={e => setFullName(e.target.value)} /></label>}
      <label>Email address<input type="email" autoComplete="email" required maxLength="254" value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label>Password<input type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} required minLength={mode === 'register' ? 8 : 1} maxLength="128" value={password} onChange={e => setPassword(e.target.value)} />{mode === 'register' && <small>Use at least 8 characters.</small>}</label>
      <button className="primary-button login-submit" type="submit" disabled={submitting}>{submitting ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in with email'}</button>
    </form>
  </section></main>
}
