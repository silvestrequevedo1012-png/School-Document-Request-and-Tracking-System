import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'

export default function RequestTable({ items = [], admin = false }) {
  const navigate = useNavigate()
  return (
    <div className="table-wrap"><table>
      <thead><tr><th>Request ID</th>{admin && <th>Requester</th>}<th>Document</th><th>Submitted</th><th>Status</th><th>Release Date</th><th>Action</th></tr></thead>
      <tbody>{items.map(item => (
        <tr key={item.id}>
          <td data-label="Request ID"><strong>{item.request_id}</strong></td>{admin && <td data-label="Requester">{item.requester_name}</td>}
          <td data-label="Document">{item.document_type}</td><td data-label="Submitted">{item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : '-'}</td>
          <td data-label="Status"><StatusBadge status={item.status} /></td><td data-label="Release Date">{item.release_date ? new Date(item.release_date).toLocaleDateString() : '-'}</td>
          <td data-label="Action"><button className="link-button" onClick={() => navigate(`${admin ? '/admin/requests' : '/requests'}/${item.request_id}`)}>View details</button></td>
        </tr>
      ))}</tbody>
    </table>{items.length === 0 && <div className="empty-state">No requests found.</div>}</div>
  )
}
