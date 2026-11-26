import { useEffect, useState } from 'react'
import api from '../services/api'
import SearchBar from '../components/SearchBar'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  useEffect(() => { api.get('/api/admin/users', { params: { search } }).then(r => setUsers(r.data)) }, [search])
  return <><div className="page-heading"><div><p className="eyebrow">Accounts</p><h1>Users</h1></div></div><section className="panel"><SearchBar value={search} onChange={setSearch} placeholder="Search name or email" /><div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Account Status</th><th>Created</th><th>Last Login</th></tr></thead><tbody>{users.map(u => <tr key={u.id}><td>{u.full_name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.is_active ? 'Active' : 'Inactive'}</td><td>{new Date(u.created_at).toLocaleDateString()}</td><td>{u.last_login ? new Date(u.last_login).toLocaleString() : '-'}</td></tr>)}</tbody></table></div></section></>
}
