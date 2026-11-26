import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState({ items: [], unread_count: 0 })
  useEffect(() => { if (localStorage.getItem('token')) api.get('/api/notifications').then(r => setData(r.data)).catch(() => {}) }, [])
  return (
    <div className="notification-wrap">
      <button className="bell-button" aria-label="Notifications" aria-expanded={open} onClick={() => setOpen(!open)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>{data.unread_count > 0 && <b>{data.unread_count}</b>}</button>
      {open && <div className="notification-menu">{data.items.slice(0, 5).map(n => <div className={n.is_read ? '' : 'unread'} key={n.id}><strong>{n.title}</strong><p>{n.message}</p></div>)}<Link to="/notifications">View all notifications</Link></div>}
    </div>
  )
}
