import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Notifications() {
  const [data, setData] = useState({ items: [] })
  const load = () => api.get('/api/notifications').then(r => setData(r.data))
  useEffect(() => { load() }, [])
  const markAll = () => api.patch('/api/notifications/read-all').then(load)
  const markOne = id => api.patch(`/api/notifications/${id}/read`).then(load)
  return <><div className="page-heading"><div><p className="eyebrow">{data.unread_count || 0} unread</p><h1>Notifications</h1></div><button className="secondary-button" onClick={markAll}>Mark All as Read</button></div><section className="panel notification-list">{data.items.map(n => <button key={n.id} className={n.is_read ? 'notification-row' : 'notification-row unread'} onClick={() => markOne(n.id)}><strong>{n.title}</strong><p>{n.message}</p><small>{new Date(n.created_at).toLocaleString()}</small></button>)}</section></>
}
