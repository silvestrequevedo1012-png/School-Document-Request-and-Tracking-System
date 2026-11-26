import { useEffect, useState } from 'react'
import api from '../services/api'
import SearchBar from '../components/SearchBar'
import { useAuth } from '../context/AuthContext'

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [updatingUserId, setUpdatingUserId] = useState(null)

  useEffect(() => {
    api.get('/api/admin/users', { params: { search } }).then(r => setUsers(r.data))
  }, [search])

  const updateRole = async (userId, role) => {
    setError('')
    setUpdatingUserId(userId)
    try {
      const { data } = await api.patch(`/api/admin/users/${userId}/role`, { role })
      setUsers(items => items.map(item => item.id === userId ? data : item))
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not update the user role.')
    } finally {
      setUpdatingUserId(null)
    }
  }

  return <><div className="page-heading"><div><p className="eyebrow">Accounts</p><h1>Users</h1><p className="heading-caption">Review accounts, school affiliations, and access roles.</p></div></div><section className="panel"><div className="history-tools"><SearchBar value={search} onChange={setSearch} placeholder="Search name or email" /><span className="result-count">{users.length} {users.length === 1 ? 'account' : 'accounts'}</span></div>{error && <div className="alert error" role="alert">{error}</div>}<div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>System Role</th><th>User Type</th><th>Account Status</th><th>Created</th><th>Last Login</th></tr></thead><tbody>{users.map(u => <tr key={u.id}><td>{u.full_name}</td><td>{u.email}</td><td><select value={u.role} disabled={u.id === currentUser?.id || updatingUserId === u.id} onChange={event => updateRole(u.id, event.target.value)} aria-label={`System role for ${u.full_name}`}><option value="User">User</option><option value="Registrar">Registrar</option><option value="Administrator">Administrator</option></select></td><td>{u.member_type || '—'}</td><td><span className={`account-state ${u.is_active ? 'active' : 'inactive'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td><td>{new Date(u.created_at).toLocaleDateString()}</td><td>{u.last_login ? new Date(u.last_login).toLocaleString() : '—'}</td></tr>)}</tbody></table>{!users.length && <div className="empty-state">No matching accounts found.</div>}</div></section></>
}
