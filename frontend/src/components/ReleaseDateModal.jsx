import { useState } from 'react'
export default function ReleaseDateModal({ open, value = '', onConfirm, onClose }) {
  const [date, setDate] = useState(value)
  if (!open) return null
  return <div className="modal-backdrop"><div className="modal"><h3>Document Release Date</h3><label>Release date<input type="date" value={date} onChange={e => setDate(e.target.value)} /></label><div className="modal-actions"><button className="secondary-button" onClick={onClose}>Close</button><button className="primary-button" disabled={!date} onClick={() => onConfirm(date)}>Save Date</button></div></div></div>
}
