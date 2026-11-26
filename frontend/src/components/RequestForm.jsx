import { DOCUMENT_TYPES } from '../utils/constants'

export default function RequestForm({ value, onChange }) {
  const set = (name, val) => onChange({ ...value, [name]: val })
  return (
    <div className="form-grid">
      <label>Document Type<select value={value.document_type} onChange={e => set('document_type', e.target.value)} required><option value="">Select document</option>{DOCUMENT_TYPES.map(type => <option key={type}>{type}</option>)}</select></label>
      <label>Purpose<textarea value={value.purpose} onChange={e => set('purpose', e.target.value)} minLength={3} maxLength={1000} required /></label>
      <label>Number of Copies<input type="number" min="1" max="20" value={value.number_of_copies} onChange={e => set('number_of_copies', Number(e.target.value))} required /></label>
      <label>Additional Notes<textarea value={value.additional_notes} onChange={e => set('additional_notes', e.target.value)} maxLength={2000} /></label>
      <label>Preferred Release Date<input type="date" value={value.preferred_release_date || ''} onChange={e => set('preferred_release_date', e.target.value || null)} /></label>
    </div>
  )
}
