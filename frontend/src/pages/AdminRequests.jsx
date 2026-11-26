import { useEffect, useState } from 'react'
import api from '../services/api'
import RequestTable from '../components/RequestTable'
import SearchBar from '../components/SearchBar'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'

export default function AdminRequests() {
  const [data, setData] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [page, setPage] = useState(1)
  useEffect(() => { setData(null); api.get('/api/admin/requests', { params: { search, status, page, page_size: 10 } }).then(r => setData(r.data)).catch(() => setData({ items: [], pages: 1 })) }, [search, status, page])
  return <><div className="page-heading"><div><p className="eyebrow">Registrar Queue</p><h1>All Requests</h1></div></div><section className="panel"><div className="history-tools"><SearchBar value={search} onChange={setSearch} placeholder="Search requester or request ID" /><select value={status} onChange={e => setStatus(e.target.value)}><option>All</option>{['Pending','Processing','On Hold','Ready for Claim','Released','Cancelled','Rejected'].map(v => <option key={v}>{v}</option>)}</select></div>{!data ? <LoadingSpinner /> : <><RequestTable items={data.items} admin /><Pagination page={page} pages={data.pages} onPage={setPage} /></>}</section></>
}
