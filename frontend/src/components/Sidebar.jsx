import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { user } = useAuth()
  const base = [
    ['/dashboard', 'Dashboard'], ['/requests', 'Request History'], ['/requests/new', 'New Request'],
    ['/notifications', 'Notifications'], ['/profile', 'Profile']
  ]
  const admin = [
    ['/admin', 'Admin Dashboard'], ['/admin/requests', 'Manage Requests'], ['/admin/users', 'Users'],
    ['/admin/email', 'Email Logs'], ['/admin/audit-logs', 'Audit Logs'], ['/admin/dsa', 'DSA Demo']
  ]
  return (
    <aside className="sidebar">
      {base.map(([path, label]) => <NavLink key={path} to={path}>{label}</NavLink>)}
      {user?.role === 'Administrator' && <><div className="sidebar-label">Administration</div>{admin.map(([path, label]) => <NavLink key={path} to={path}>{label}</NavLink>)}</>}
    </aside>
  )
}
