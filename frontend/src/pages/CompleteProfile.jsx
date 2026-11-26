import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function CompleteProfile() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    address: user?.address || '',
    age: user?.age || '',
    contact_number: user?.contact_number || '',
    school_id: user?.school_id || '',
    department: user?.department || '',
    course: user?.course || '',
    member_type: user?.member_type || 'Student',
    graduation_year: user?.graduation_year || '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const update = (event) => setForm(current => ({ ...current, [event.target.name]: event.target.value }))

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const payload = {
      ...form,
      age: Number(form.age),
      course: form.member_type === 'Faculty' ? null : form.course,
      graduation_year: form.member_type === 'Graduated' ? Number(form.graduation_year) : null,
    }
    try {
      const { data } = await api.patch('/api/auth/me/profile', payload)
      updateUser(data)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(Array.isArray(detail) ? detail.map(item => item.msg).join(' ') : detail || 'Could not save your profile. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return <>
    <div className="page-heading"><div><p className="eyebrow">One-time setup</p><h1>Complete your profile</h1></div></div>
    <section className="panel profile-completion">
      <p>To continue with your personal Gmail account, please provide your school and contact details. NEMSU Docs uses them to verify your school affiliation and follow up on document requests.</p>
      {error && <div className="alert error" role="alert">{error}</div>}
      <form className="login-form profile-completion-form" onSubmit={handleSubmit}>
        <label>Full name<input name="full_name" autoComplete="name" required minLength="2" maxLength="120" value={form.full_name} onChange={update} /></label>
        <label>Email address<input value={user?.email || ''} readOnly /></label>
        <label className="profile-address">Address<textarea name="address" autoComplete="street-address" required minLength="5" maxLength="500" value={form.address} onChange={update} /></label>
        <label>Age<input name="age" type="number" min="5" max="120" required value={form.age} onChange={update} /></label>
        <label>Contact number<input name="contact_number" type="tel" autoComplete="tel" required minLength="7" maxLength="30" placeholder="e.g. +63 912 345 6789" value={form.contact_number} onChange={update} /></label>
        <label>School ID<input name="school_id" required minLength="2" maxLength="80" value={form.school_id} onChange={update} /></label>
        <label>Department<input name="department" required minLength="2" maxLength="120" value={form.department} onChange={update} /></label>
        <label>School affiliation<select name="member_type" required value={form.member_type} onChange={update}><option>Student</option><option>Faculty</option><option>Graduated</option></select></label>
        {form.member_type !== 'Faculty' && <label>Course<input name="course" required minLength="2" maxLength="120" value={form.course} onChange={update} /></label>}
        {form.member_type === 'Graduated' && <label>Graduation year<input name="graduation_year" type="number" min="1900" max={new Date().getFullYear()} required value={form.graduation_year} onChange={update} /></label>}
        <button className="primary-button login-submit profile-save" type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save and continue'}</button>
      </form>
    </section>
  </>
}
