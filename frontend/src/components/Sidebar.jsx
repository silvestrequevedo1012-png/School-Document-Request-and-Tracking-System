import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { user } = useAuth()
  const base = [
    ['/dashboard', 'Dashboard', 'OV'], ['/requests', 'Requests', 'RQ'], ['/requests/new', 'New Request', '+'],
    ['/notifications', 'Notifications', 'NT'], ['/profile', 'Profile', 'ME']
  ]
  const admin = [
    ['/admin', 'Overview', 'AD'], ['/admin/requests', 'Manage Requests', 'RQ'], ['/admin/users', 'Users', 'US'],
    ['/admin/email', 'Email Logs', 'EM'], ['/admin/audit-logs', 'Audit Logs', 'AU'], ['/admin/dsa', 'DSA Demo', 'DS']
  ]
  return (
    <aside className="sidebar">
      <div className="sidebar-section-label">Workspace</div>
      {base.map(([path, label, icon]) => <NavLink key={path} to={path}><span className="sidebar-icon">{icon}</span><span>{label}</span></NavLink>)}
      {user?.role === 'Administrator' && <><div className="sidebar-label">Administration</div>{admin.map(([path, label, icon]) => <NavLink key={path} to={path}><span className="sidebar-icon">{icon}</span><span>{label}</span></NavLink>)}</>}
    </aside>
  )
}
