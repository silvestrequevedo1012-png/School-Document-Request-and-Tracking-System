import { useEffect, useState } from 'react'
import api from '../services/api'
import SearchBar from '../components/SearchBar'
import { useAuth } from '../context/AuthContext'

const emptyRegistrar = { full_name: '', email: '', password: '' }

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [registrar, setRegistrar] = useState(emptyRegistrar)
  const [creating, setCreating] = useState(false)
  const [updatingUserId, setUpdatingUserId] = useState(null)

  const loadUsers = () => api.get('/api/admin/users', { params: { search } }).then(r => setUsers(r.data))

  useEffect(() => {
    loadUsers().catch(err => setError(err.response?.data?.detail || 'Could not load accounts.'))
  }, [search])

  const updateRole = async (userId, role) => {
    setError('')
    setMessage('')
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

  const createRegistrar = async event => {
    event.preventDefault()
    setError('')
    setMessage('')
    setCreating(true)
    try {
      await api.post('/api/admin/users/registrars', registrar)
      setRegistrar(emptyRegistrar)
      setMessage('Registrar account created.')
      await loadUsers()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not create the registrar account.')
    } finally {
      setCreating(false)
    }
  }

  const deleteUser = async account => {
    if (!window.confirm(`Delete ${account.full_name}'s account? Their document requests and request history will also be deleted.`)) return
    setError('')
    setMessage('')
    try {
      await api.delete(`/api/admin/users/${account.id}`)
      setUsers(items => items.filter(item => item.id !== account.id))
      setMessage(`${account.full_name}'s account was deleted.`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not delete the account.')
    }
  }

  return <>
    <div className="page-heading"><div><p className="eyebrow">Accounts</p><h1>Users</h1><p className="heading-caption">Create registrar accounts and manage school access.</p></div></div>
    <section className="panel">
      <h2>Create registrar account</h2>
      <form className="history-tools" onSubmit={createRegistrar}>
        <input aria-label="Registrar full name" autoComplete="name" placeholder="Full name" minLength="2" maxLength="120" required value={registrar.full_name} onChange={e => setRegistrar({ ...registrar, full_name: e.target.value })} />
        <input aria-label="Registrar email" type="email" autoComplete="email" placeholder="Email address" maxLength="254" required value={registrar.email} onChange={e => setRegistrar({ ...registrar, email: e.target.value })} />
        <input aria-label="Registrar password" type="password" autoComplete="new-password" placeholder="Password (at least 8 characters)" minLength="8" maxLength="128" required value={registrar.password} onChange={e => setRegistrar({ ...registrar, password: e.target.value })} />
        <button className="primary-button" disabled={creating}>{creating ? 'Creating…' : 'Create registrar'}</button>
      </form>
    </section>
    <section className="panel">
      <div className="history-tools"><SearchBar value={search} onChange={setSearch} placeholder="Search name or email" /><span className="result-count">{users.length} {users.length === 1 ? 'account' : 'accounts'}</span></div>
      {error && <div className="alert error" role="alert">{error}</div>}
      {message && <div className="alert" role="status">{message}</div>}
      <div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>System Role</th><th>User Type</th><th>Account Status</th><th>Created</th><th>Last Login</th><th>Action</th></tr></thead><tbody>
        {users.map(u => <tr key={u.id}>
          <td>{u.full_name}</td><td>{u.email}</td>
          <td><select value={u.role} disabled={u.id === currentUser?.id || updatingUserId === u.id} onChange={event => updateRole(u.id, event.target.value)} aria-label={`System role for ${u.full_name}`}><option value="User">User</option><option value="Registrar">Registrar</option><option value="Administrator">Administrator</option></select></td>
          <td>{u.member_type || '—'}</td>
          <td><span className={`account-state ${u.is_active ? 'active' : 'inactive'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
          <td>{new Date(u.created_at).toLocaleDateString()}</td><td>{u.last_login ? new Date(u.last_login).toLocaleString() : '—'}</td>
          <td>{u.id !== currentUser?.id && <button className="danger-button" onClick={() => deleteUser(u)}>Delete</button>}</td>
        </tr>)}
      </tbody></table>{!users.length && <div className="empty-state">No matching accounts found.</div>}</div>
    </section>
  </>
}
