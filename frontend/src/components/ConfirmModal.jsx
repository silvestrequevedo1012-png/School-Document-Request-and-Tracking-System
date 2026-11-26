export default function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', onConfirm, onClose }) {
  if (!open) return null
  return <div className="modal-backdrop"><div className="modal"><h3>{title}</h3><p>{message}</p><div className="modal-actions"><button className="secondary-button" onClick={onClose}>Close</button><button className="danger-button" onClick={onConfirm}>{confirmLabel}</button></div></div></div>
}
