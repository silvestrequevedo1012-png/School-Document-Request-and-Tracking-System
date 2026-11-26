import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import StatusBadge from '../components/StatusBadge'
import RequestTimeline from '../components/RequestTimeline'
import ConfirmModal from '../components/ConfirmModal'
import LoadingSpinner from '../components/LoadingSpinner'

export default function RequestDetails() {
  const { requestId } = useParams()
  const [request, setRequest] = useState(null)
  const [confirm, setConfirm] = useState(false)
  const [reason, setReason] = useState('')
  useEffect(() => { api.get(`/api/requests/${requestId}`).then(r => setRequest(r.data)).catch(() => setRequest(null)) }, [requestId])
  const cancel = async () => {
    try { const { data } = await api.patch(`/api/requests/${requestId}/cancel`, { reason: reason || 'Cancelled by requester' }); setRequest(data); setConfirm(false) } catch (err) { alert(err.response?.data?.detail || 'Unable to cancel request') }
  }
  if (!request) return <LoadingSpinner />
  const canCancel = ['Pending', 'On Hold'].includes(request.status)
  const releaseAvailability = request.release_date ? (new Date(request.release_date + 'T00:00:00') <= new Date() ? 'Available for Claim' : 'Not Yet Available for Claim') : 'Release date not set'
  return <><div className="page-heading"><div><p className="eyebrow">Request Details</p><h1>{request.request_id}</h1></div><StatusBadge status={request.status} /></div><div className="details-grid"><section className="panel details"><dl><dt>Requester</dt><dd>{request.requester_name}</dd><dt>Document Type</dt><dd>{request.document_type}</dd><dt>Purpose</dt><dd>{request.purpose}</dd><dt>Number of Copies</dt><dd>{request.number_of_copies}</dd><dt>Additional Notes</dt><dd>{request.additional_notes || '-'}</dd><dt>Submitted Date</dt><dd>{new Date(request.submitted_at).toLocaleString()}</dd><dt>Release Date</dt><dd>{request.release_date ? new Date(request.release_date).toLocaleDateString() : 'Not set'}</dd><dt>Claim Availability</dt><dd>{releaseAvailability}</dd><dt>Last Updated</dt><dd>{new Date(request.updated_at).toLocaleString()}</dd></dl>{canCancel && <button className="danger-button" onClick={() => setConfirm(true)}>Cancel Request</button>}</section><section className="panel"><h2>Status Timeline</h2><RequestTimeline history={request.status_history} request={request} /></section></div><ConfirmModal open={confirm} title="Cancel Request" message={<><p>Cancellation is permanent. Enter a reason.</p><input className="modal-input" value={reason} onChange={e => setReason(e.target.value)} /></>} confirmLabel="Cancel Request" onConfirm={cancel} onClose={() => setConfirm(false)} /></>
}
