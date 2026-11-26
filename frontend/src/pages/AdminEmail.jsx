import { useEffect, useState } from 'react'
import api from '../services/api'

export default function AdminEmail() {
  const [email, setEmail] = useState('')
  const [logs, setLogs] = useState([])
  const [message, setMessage] = useState('')
  const load = () => api.get('/api/admin/email-logs').then(r => setLogs(r.data))
  useEffect(load, [])
  const send = async e => {
    e.preventDefault()
    try { const { data } = await api.post('/api/admin/email/test', { email }); setMessage(data.detail); load() } catch (err) { setMessage(err.response?.data?.detail || 'Test email failed') }
  }
  return <><div className="page-heading"><div><p className="eyebrow">Brevo SMTP</p><h1>Email Logs</h1><p className="heading-caption">Send a delivery check and review recent system emails.</p></div></div><section className="panel"><form className="test-email" onSubmit={send}><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="recipient@example.com" aria-label="Test email recipient" /><button className="primary-button">Send test email</button></form>{message && <div className="alert" role="status">{message}</div>}<div className="table-wrap"><table><thead><tr><th>Recipient</th><th>Type</th><th>Subject</th><th>Status</th><th>Error</th><th>Sent</th></tr></thead><tbody>{logs.map(l => { const state = l.status?.toLowerCase(); return <tr key={l.id}><td>{l.recipient_email}</td><td>{l.email_type}</td><td>{l.subject}</td><td><span className={`account-state ${state === 'sent' ? 'active' : state === 'pending' ? 'pending' : 'inactive'}`}>{l.status}</span></td><td>{l.error_message || '—'}</td><td>{l.sent_at ? new Date(l.sent_at).toLocaleString() : '—'}</td></tr> })}</tbody></table>{!logs.length && <div className="empty-state">No email activity yet.</div>}</div></section></>
}
