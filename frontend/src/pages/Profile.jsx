import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  return <><div className="page-heading"><div><p className="eyebrow">Account</p><h1>Profile</h1></div></div><section className="panel profile-card">{user?.profile_picture && <img src={user.profile_picture} alt="" />}<dl><dt>Name</dt><dd>{user?.full_name}</dd><dt>Email</dt><dd>{user?.email}</dd><dt>Role</dt><dd>{user?.role}</dd><dt>School ID</dt><dd>{user?.school_id || 'Not assigned'}</dd></dl></section></>
}
