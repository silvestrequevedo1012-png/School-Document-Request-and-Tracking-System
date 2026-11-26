import { useState } from 'react'
export default function RejectModal({ open, onConfirm, onClose }) {
  const [reason, setReason] = useState('')
  if (!open) return null
  return <div className="modal-backdrop"><div className="modal"><h3>Reject Request</h3><label>Rejection reason<select value={reason} onChange={e => setReason(e.target.value)}><option value="">Select reason</option>{['Incomplete information','Missing requirement','Invalid request','Duplicate request','Request cannot be processed','Other'].map(v => <option key={v}>{v}</option>)}</select></label><div className="modal-actions"><button className="secondary-button" onClick={onClose}>Close</button><button className="danger-button" disabled={!reason} onClick={() => onConfirm(reason)}>Reject</button></div></div></div>
}
