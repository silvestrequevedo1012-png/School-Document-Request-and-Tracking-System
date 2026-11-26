import { useEffect, useState } from 'react'
import api from '../services/api'
import Pagination from '../components/Pagination'
import SearchBar from '../components/SearchBar'

export default function AdminAuditLogs() {
  const [data, setData] = useState({ items: [], pages: 1 })
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('All')
  const [page, setPage] = useState(1)
  useEffect(() => { api.get('/api/admin/audit-logs', { params: { search, action, page, page_size: 10 } }).then(r => setData(r.data)) }, [search, action, page])
  return <><div className="page-heading"><div><p className="eyebrow">Security</p><h1>Audit Logs</h1></div></div><section className="panel"><div className="history-tools"><SearchBar value={search} onChange={setSearch} placeholder="Search descriptions" /><select value={action} onChange={e => setAction(e.target.value)}><option>All</option>{['PROCESS_REQUEST','HOLD_REQUEST','RESUME_REQUEST','REJECT_REQUEST','CANCEL_REQUEST','SET_RELEASE_DATE','READY_FOR_CLAIM','RELEASE_DOCUMENT'].map(v => <option key={v}>{v}</option>)}</select></div><div className="table-wrap"><table><thead><tr><th>Administrator ID</th><th>Request ID</th><th>Action</th><th>Description</th><th>Date/Time</th></tr></thead><tbody>{data.items.map(l => <tr key={l.id}><td>{l.admin_id}</td><td>{l.request_id || '-'}</td><td>{l.action}</td><td>{l.description}</td><td>{new Date(l.created_at).toLocaleString()}</td></tr>)}</tbody></table></div><Pagination page={page} pages={data.pages} onPage={setPage} /></section></>
}
