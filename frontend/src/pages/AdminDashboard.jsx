import { useEffect, useState } from 'react'
import api from '../services/api'
import DashboardCard from '../components/DashboardCard'
import RequestTable from '../components/RequestTable'
import LoadingSpinner from '../components/LoadingSpinner'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  useEffect(() => { api.get('/api/admin/dashboard').then(r => setData(r.data)).catch(() => setData(null)) }, [])
  if (!data) return <LoadingSpinner />
  return <><div className="page-heading"><div><p className="eyebrow">Registrar</p><h1>Admin Dashboard</h1></div></div><div className="cards-grid">{Object.entries(data.counts).map(([name, value]) => <DashboardCard key={name} title={name[0].toUpperCase() + name.slice(1)} value={value} />)}</div><section className="panel"><h2>Pending FIFO Queue</h2><RequestTable items={data.queue} admin /></section></>
}
