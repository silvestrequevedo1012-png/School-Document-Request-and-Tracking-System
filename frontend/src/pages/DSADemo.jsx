import { useEffect, useState } from 'react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function DSADemo() {
  const [data, setData] = useState(null)
  const [name, setName] = useState('')
  const [requestId, setRequestId] = useState('')
  const [sortKey, setSortKey] = useState('request_id')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { data: result } = await api.get('/api/admin/dsa', {
        params: { search_name: name, search_request_id: requestId, sort_key: sortKey },
      })
      setData(result)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not load the DSA demo. Check that the API is online and your account has administrator access.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [sortKey])

  return <>
    <div className="page-heading"><div><p className="eyebrow">Data Structures & Algorithms</p><h1>DSA Demonstration</h1></div></div>
    {error && <div className="alert error" role="alert">{error}</div>}
    {loading && <LoadingSpinner />}
    {!loading && data && <div className="dsa-grid">
      <section className="panel"><h2>FIFO Queue</h2><div className="chip-list">{data.queue.map(id => <span className="chip" key={id}>{id}</span>)}</div><small>{data.complexities.fifo}</small></section>
      <section className="panel"><h2>Linear Search</h2><input value={name} onChange={event => setName(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') load() }} placeholder="Requester name" /><button className="secondary-button" onClick={load}>Search</button><p>{data.linear_search.length} result(s)</p><small>{data.complexities.linear}</small></section>
      <section className="panel"><h2>Binary Search</h2><input value={requestId} onChange={event => setRequestId(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') load() }} placeholder="REQ-000001" /><button className="secondary-button" onClick={load}>Search</button><p>{data.binary_search ? data.binary_search.request_id : 'Not found'}</p><small>{data.complexities.binary}</small></section>
      <section className="panel dsa-wide"><h2>Bubble Sort</h2><select value={sortKey} onChange={event => setSortKey(event.target.value)} aria-label="Sort requests by"><option value="request_id">Request ID</option><option value="name">Name</option><option value="submitted">Submission date</option><option value="release_date">Release date</option></select><div className="before-after"><div><h3>Before Sorting</h3>{data.before_sort.map(row => <p key={row.request_id}>{row.request_id} — {row.requester_name}</p>)}</div><div><h3>After Sorting</h3>{data.after_sort.map(row => <p key={row.request_id}>{row.request_id} — {row.requester_name}</p>)}</div></div><small>{data.complexities.bubble}</small></section>
    </div>}
  </>
}
