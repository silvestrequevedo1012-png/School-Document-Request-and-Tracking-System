export default function DashboardCard({ title, value, tone = 'green' }) {
  return <div className={`dashboard-card ${tone}`}><span>{title}</span><strong>{value ?? 0}</strong></div>
}
