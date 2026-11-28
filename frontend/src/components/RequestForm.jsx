import { DOCUMENT_TYPES } from '../utils/constants'

export default function RequestForm({ value, onChange }) {
  const set = (name, val) => onChange({ ...value, [name]: val })
  return (
    <div className="form-grid request-form-grid">
      <label>Document Type<span className="field-hint">Choose the document you need</span><select value={value.document_type} onChange={e => set('document_type', e.target.value)} required><option value="">Select document</option>{DOCUMENT_TYPES.map(type => <option key={type}>{type}</option>)}</select></label>
      <label>Purpose<span className="field-hint">Briefly state why you need this document</span><textarea value={value.purpose} onChange={e => set('purpose', e.target.value)} minLength={3} maxLength={1000} placeholder="Example: Employment requirements" required /></label>
      <label>Number of Copies<span className="field-hint">Maximum of 20 copies</span><input type="number" min="1" max="20" value={value.number_of_copies} onChange={e => set('number_of_copies', Number(e.target.value))} required /></label>
      <label>Additional Notes<span className="field-hint">Optional</span><textarea value={value.additional_notes} onChange={e => set('additional_notes', e.target.value)} maxLength={2000} placeholder="Add any special instructions" /></label>
      <label>Preferred Release Date<span className="field-hint">Optional</span><input type="date" value={value.preferred_release_date || ''} onChange={e => set('preferred_release_date', e.target.value || null)} /></label>
    </div>
  )
}
