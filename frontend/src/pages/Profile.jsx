import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow">Account</p><h1>Profile</h1></div>
      </div>
      <section className="panel profile-card">
        {user?.profile_picture && <img src={user.profile_picture} alt="" />}
        <dl>
          <dt>Name</dt><dd>{user?.full_name}</dd>
          <dt>Email</dt><dd>{user?.email}</dd>
          <dt>System role</dt><dd>{user?.role}</dd>
          <dt>School affiliation</dt><dd>{user?.member_type || '—'}</dd>
          <dt>School ID</dt><dd>{user?.school_id || '—'}</dd>
          <dt>Address</dt><dd>{user?.address || '—'}</dd>
          <dt>Age</dt><dd>{user?.age ?? '—'}</dd>
          <dt>Contact number</dt><dd>{user?.contact_number || '—'}</dd>
          <dt>Department</dt><dd>{user?.department || '—'}</dd>
          <dt>Course</dt><dd>{user?.course || '—'}</dd>
          {user?.member_type === 'Graduated' && <>
            <dt>Graduation year</dt><dd>{user?.graduation_year || '—'}</dd>
          </>}
        </dl>
      </section>
    </>
  )
}
