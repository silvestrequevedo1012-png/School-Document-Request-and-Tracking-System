import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import StatusBadge from '../components/StatusBadge'
import RequestTimeline from '../components/RequestTimeline'
import RejectModal from '../components/RejectModal'
import ReleaseDateModal from '../components/ReleaseDateModal'
import ConfirmModal from '../components/ConfirmModal'
import LoadingSpinner from '../components/LoadingSpinner'

export default function AdminRequestDetails() {
  const { requestId } = useParams()
  const [request, setRequest] = useState(null)
  const [modal, setModal] = useState('')
  const load = () => api.get(`/api/requests/${requestId}`).then(r => setRequest(r.data))
  useEffect(() => { load() }, [requestId])
  const action = async (name, payload) => {
    try {
      await api({ method: name.method, url: name.url(payload), data: payload?.body })
      setModal('')
      await load()
    } catch (err) { alert(err.response?.data?.detail || 'Action failed') }
  }
  if (!request) return <LoadingSpinner />
  return <><div className="page-heading"><div><p className="eyebrow">Administration</p><h1>{request.request_id}</h1></div><StatusBadge status={request.status} /></div><div className="details-grid"><section className="panel"><dl><dt>Requester</dt><dd>{request.requester_name}</dd><dt>Document</dt><dd>{request.document_type}</dd><dt>Purpose</dt><dd>{request.purpose}</dd><dt>Copies</dt><dd>{request.number_of_copies}</dd><dt>Release Date</dt><dd>{request.release_date || 'Not set'}</dd></dl><div className="action-grid">
    {request.status === 'Pending' && <button className="primary-button" onClick={() => action({ method:'post', url:()=>`/api/admin/requests/${requestId}/process` })}>Process</button>}
    {request.status === 'Processing' && <button className="secondary-button" onClick={() => action({ method:'post', url:()=>`/api/admin/requests/${requestId}/hold` })}>Hold</button>}
    {request.status === 'On Hold' && <button className="primary-button" onClick={() => action({ method:'post', url:()=>`/api/admin/requests/${requestId}/resume` })}>Resume</button>}
    {['Pending','Processing','On Hold'].includes(request.status) && <button className="danger-button" onClick={() => setModal('reject')}>Reject</button>}
    {['Pending','Processing','On Hold'].includes(request.status) && <button className="danger-button" onClick={() => setModal('cancel')}>Cancel</button>}
    {['Processing','On Hold','Ready for Claim'].includes(request.status) && <button className="secondary-button" onClick={() => setModal('date')}>Set Release Date</button>}
    {request.status === 'Processing' && request.release_date && <button className="primary-button" onClick={() => action({ method:'post', url:()=>`/api/admin/requests/${requestId}/ready` })}>Ready for Claim</button>}
    {request.status === 'Ready for Claim' && <button className="primary-button" onClick={() => setModal('release')}>Release Document</button>}
  </div></section><section className="panel"><h2>Status Timeline</h2><RequestTimeline history={request.status_history} request={request} /></section></div>
  <RejectModal open={modal === 'reject'} onClose={() => setModal('')} onConfirm={reason => action({ method:'post', url:()=>`/api/admin/requests/${requestId}/reject`, body:{reason} })} />
  <ReleaseDateModal open={modal === 'date'} value={request.release_date || ''} onClose={() => setModal('')} onConfirm={release_date => action({ method:'patch', url:()=>`/api/admin/requests/${requestId}/release-date`, body:{release_date} })} />
  <ConfirmModal open={modal === 'release'} title="Release Document" message="Mark this document as released?" confirmLabel="Release" onClose={() => setModal('')} onConfirm={() => action({ method:'post', url:()=>`/api/admin/requests/${requestId}/release` })} />
  <ConfirmModal open={modal === 'cancel'} title="Cancel Request" message="Cancel this request?" confirmLabel="Cancel" onClose={() => setModal('')} onConfirm={() => action({ method:'post', url:()=>`/api/admin/requests/${requestId}/cancel`, body:{reason:'Cancelled by administrator'} })} />
  </>
}
