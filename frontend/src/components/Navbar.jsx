import { Link } from 'react-router-dom'
import NotificationDropdown from './NotificationDropdown'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  return (
    <header className="navbar">
      <Link className="brand" to="/dashboard"><span className="brand-mark">SD</span><span>Registrar System</span></Link>
      <div className="nav-actions">
        <NotificationDropdown />
        {user && <button className="avatar-button" title={user.full_name} onClick={logout}>{user.full_name?.[0] || 'U'}</button>}
      </div>
    </header>
  )
}
