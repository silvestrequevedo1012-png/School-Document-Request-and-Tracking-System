import { useEffect, useState } from 'react'
import api from '../services/api'
import DashboardCard from '../components/DashboardCard'
import RequestTable from '../components/RequestTable'
import LoadingSpinner from '../components/LoadingSpinner'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const { user } = useAuth()
  useEffect(() => { api.get('/api/requests/history?page_size=5').then(r => setData(r.data)).catch(() => setData({ items: [], total: 0 })) }, [])
  if (!data) return <LoadingSpinner />
  const counts = data.items.reduce((acc, item) => ({ ...acc, [item.status]: (acc[item.status] || 0) + 1 }), {})
  return <><div className="page-heading dashboard-heading"><div><p className="eyebrow">NEMSU Docs · Overview</p><h1>Welcome back, {user?.full_name?.split(' ')[0] || 'there'}</h1><p className="heading-caption">Track your document requests and stay up to date.</p></div><Link className="primary-button heading-action" to="/requests/new">＋ New request</Link></div><div className="cards-grid">{['Pending','Processing','Ready for Claim','Released'].map((status, index) => <DashboardCard key={status} title={status} value={counts[status] || 0} tone={['amber','blue','cyan','green'][index]} />)}<DashboardCard title="Total Requests" value={data.total} tone="navy" /></div><section className="panel"><div className="section-heading"><div><p className="eyebrow">Latest activity</p><h2>Recent Requests</h2></div><Link className="subtle-link" to="/requests">View all requests →</Link></div><RequestTable items={data.items} /></section></>
}
