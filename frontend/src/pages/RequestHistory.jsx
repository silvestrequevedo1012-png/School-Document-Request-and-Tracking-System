import { useEffect, useState } from 'react'
import api from '../services/api'
import FilterBar from '../components/FilterBar'
import SearchBar from '../components/SearchBar'
import RequestTable from '../components/RequestTable'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'

export default function RequestHistory() {
  const [filters, setFilters] = useState({ status: 'All', document: 'All', date_filter: 'All', date_from: '', date_to: '', search: '', sort: 'newest' })
  const [data, setData] = useState(null)
  const [page, setPage] = useState(1)
  useEffect(() => {
    setData(null)
    api.get('/api/requests/history', { params: { ...filters, page, page_size: 10 } }).then(r => setData(r.data)).catch(() => setData({ items: [], pages: 1 }))
  }, [filters, page])
  return <><div className="page-heading"><div><p className="eyebrow">Your Records</p><h1>Request History</h1></div></div><div className="panel"><div className="history-tools"><SearchBar value={filters.search} onChange={v => setFilters({ ...filters, search: v })} /><select value={filters.sort} onChange={e => setFilters({ ...filters, sort: e.target.value })}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="request_asc">Request ID ascending</option><option value="request_desc">Request ID descending</option><option value="release_asc">Release date ascending</option><option value="release_desc">Release date descending</option></select></div><FilterBar filters={filters} setFilters={setFilters} />{!data ? <LoadingSpinner /> : <><RequestTable items={data.items} /><Pagination page={page} pages={data.pages} onPage={setPage} /></>}</div></>
}
