import { Link } from 'react-router-dom'
import NotificationDropdown from './NotificationDropdown'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  return (
    <header className="navbar">
      <Link className="brand" to="/dashboard"><img className="brand-logo" src="/nemsu-docs-mark.svg" alt="" /><span>NEMSU Docs</span></Link>
      <div className="nav-actions">
        <NotificationDropdown />
        {user && <div className="nav-user"><span className="nav-user-name">{user.full_name}</span><button className="avatar-button" title="Sign out" aria-label="Sign out" onClick={logout}>{user.full_name?.[0] || 'U'}</button></div>}
      </div>
    </header>
  )
}
