import { useEffect, useState } from 'react'
import api from '../services/api'
import Pagination from '../components/Pagination'
import SearchBar from '../components/SearchBar'
import LoadingSpinner from '../components/LoadingSpinner'

export default function AdminAuditLogs() {
  const [data, setData] = useState({ items: [], pages: 1 })
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('All')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    api.get('/api/admin/audit-logs', { params: { search, action, page, page_size: 10 } })
      .then(({ data: result }) => {
        if (active) setData({ items: result.items || [], pages: result.pages || 1 })
      })
      .catch(err => {
        if (active) setError(err.response?.data?.detail || 'Could not load audit logs. Check that the API is online and your account has administrator access.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [search, action, page])

  return <>
    <div className="page-heading"><div><p className="eyebrow">Security</p><h1>Audit Logs</h1><p className="heading-caption">A record of administrative actions and request changes.</p></div></div>
    <section className="panel">
      <div className="history-tools">
        <SearchBar value={search} onChange={value => { setSearch(value); setPage(1) }} placeholder="Search descriptions" />
        <select value={action} onChange={event => { setAction(event.target.value); setPage(1) }} aria-label="Filter audit logs by action">
          <option>All</option>
          {['PROCESS_REQUEST', 'HOLD_REQUEST', 'RESUME_REQUEST', 'REJECT_REQUEST', 'CANCEL_REQUEST', 'SET_RELEASE_DATE', 'READY_FOR_CLAIM', 'RELEASE_DOCUMENT', 'UPDATE_USER_ROLE', 'CREATE_REGISTRAR', 'DELETE_USER'].map(value => <option key={value}>{value}</option>)}
        </select>
      </div>
      {error && <div className="alert error" role="alert">{error}</div>}
      {loading ? <LoadingSpinner /> : <>
        <div className="table-wrap"><table><thead><tr><th>Staff ID</th><th>Request ID</th><th>Action</th><th>Description</th><th>Date/Time</th></tr></thead><tbody>
          {data.items.map(item => <tr key={item.id}>
            <td>{item.admin_id}</td><td>{item.request_id || '—'}</td>
            <td><span className="audit-action">{String(item.action || 'Unknown').replaceAll('_', ' ')}</span></td>
            <td>{item.description || '—'}</td><td>{item.created_at ? new Date(item.created_at).toLocaleString() : '—'}</td>
          </tr>)}
        </tbody></table>{!data.items.length && <div className="empty-state">No audit events match these filters.</div>}</div>
        <Pagination page={page} pages={data.pages} onPage={setPage} />
      </>}
    </section>
  </>
}
