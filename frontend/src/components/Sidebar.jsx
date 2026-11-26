import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { user } = useAuth()
  const userLinks = [
    ['/dashboard', 'Dashboard', 'Home', 'OV'], ['/requests', 'Requests', 'Requests', 'RQ'], ['/requests/new', 'New Request', 'New', '+'],
    ['/notifications', 'Notifications', 'Alerts', 'NT']
  ]
  const registrar = [
    ['/admin', 'Request Overview', 'Overview', 'OV'], ['/admin/requests', 'Manage Requests', 'Queue', 'RQ']
  ]
  const admin = [
    ['/admin', 'Request Overview', 'Overview', 'OV'], ['/admin/requests', 'Manage Requests', 'Queue', 'RQ'], ['/admin/users', 'Users', 'Users', 'US'],
    ['/admin/email', 'Email Logs', 'Email', 'EM'], ['/admin/audit-logs', 'Audit Logs', 'Audit', 'AU'], ['/admin/dsa', 'DSA Demo', 'DSA', 'DS']
  ]
  const link = ([path, label, compact, icon]) => <NavLink key={path} to={path} aria-label={label}><span className="sidebar-icon" aria-hidden="true">{icon}</span><span className="sidebar-desktop-label">{label}</span><span className="sidebar-mobile-label">{compact}</span></NavLink>
  return (
    <aside className="sidebar">
      {user?.role === 'User' && <><div className="sidebar-section-label">Workspace</div>{userLinks.map(link)}</>}
      {user?.role === 'Registrar' && <><div className="sidebar-section-label">Request Management</div>{registrar.map(link)}</>}
      {user?.role === 'Administrator' && <><div className="sidebar-label">Administration</div>{admin.map(link)}</>}
      <div className="sidebar-section-label">Account</div>
      {link(['/profile', 'Profile', 'Profile', 'ME'])}
    </aside>
  )
}
