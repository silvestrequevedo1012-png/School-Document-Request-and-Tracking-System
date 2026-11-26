import { useEffect, useState } from 'react'
import api from '../services/api'
import DashboardCard from '../components/DashboardCard'
import RequestTable from '../components/RequestTable'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Dashboard() {
  const [data, setData] = useState(null)
  useEffect(() => { api.get('/api/requests/history?page_size=5').then(r => setData(r.data)).catch(() => setData({ items: [], total: 0 })) }, [])
  if (!data) return <LoadingSpinner />
  const counts = data.items.reduce((acc, item) => ({ ...acc, [item.status]: (acc[item.status] || 0) + 1 }), {})
  return <><div className="page-heading"><div><p className="eyebrow">Overview</p><h1>Dashboard</h1></div></div><div className="cards-grid">{['Pending','Processing','Ready for Claim','Released'].map(status => <DashboardCard key={status} title={status} value={counts[status] || 0} />)}<DashboardCard title="Total" value={data.total} /></div><section className="panel"><h2>Recent Requests</h2><RequestTable items={data.items} /></section></>
}
