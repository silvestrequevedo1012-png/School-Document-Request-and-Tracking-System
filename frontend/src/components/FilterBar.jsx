import { DOCUMENT_TYPES, STATUSES } from '../utils/constants'

export default function FilterBar({ filters, setFilters }) {
  const set = (name, value) => setFilters({ ...filters, [name]: value })
  return (
    <div className="filter-bar">
      <select value={filters.status} onChange={e => set('status', e.target.value)}><option>All</option>{STATUSES.map(v => <option key={v}>{v}</option>)}</select>
      <select value={filters.document} onChange={e => set('document', e.target.value)}><option>All</option>{DOCUMENT_TYPES.map(v => <option key={v}>{v}</option>)}</select>
      <select value={filters.date_filter} onChange={e => set('date_filter', e.target.value)}><option>All</option><option>Today</option><option>Last 7 days</option><option>Last 30 days</option><option>Custom</option></select>
      {filters.date_filter === 'Custom' && <><input type="date" value={filters.date_from} onChange={e => set('date_from', e.target.value)} /><input type="date" value={filters.date_to} onChange={e => set('date_to', e.target.value)} /></>}
      <button className="secondary-button" onClick={() => setFilters({ status: 'All', document: 'All', date_filter: 'All', date_from: '', date_to: '', search: '', sort: 'newest' })}>Clear Filters</button>
    </div>
  )
}
