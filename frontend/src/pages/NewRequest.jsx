import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import RequestForm from '../components/RequestForm'

export default function NewRequest() {
  const navigate = useNavigate()
  const [value, setValue] = useState({ document_type: '', purpose: '', number_of_copies: 1, additional_notes: '', preferred_release_date: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const submit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/api/requests', value)
      setSuccess(`Request Submitted Successfully\nRequest ID: ${data.request_id}`)
      setTimeout(() => navigate(`/requests/${data.request_id}`), 1000)
    } catch (err) { setError(err.response?.data?.detail || 'Unable to submit request') } finally { setLoading(false) }
  }
  return <><div className="page-heading"><div><p className="eyebrow">Create</p><h1>New Document Request</h1></div></div><form className="panel" onSubmit={submit}>{error && <div className="alert error">{error}</div>}{success && <div className="alert success">{success}</div>}<RequestForm value={value} onChange={setValue} /><button className="primary-button" disabled={loading}>{loading ? 'Submitting...' : 'Submit Request'}</button></form></>
}
