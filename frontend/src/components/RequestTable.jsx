import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'

export default function RequestTable({ items = [], admin = false }) {
  const navigate = useNavigate()
  return (
    <div className="table-wrap"><table>
      <thead><tr><th>Request ID</th>{admin && <th>Requester</th>}<th>Document</th><th>Submitted</th><th>Status</th><th>Release Date</th><th>Action</th></tr></thead>
      <tbody>{items.map(item => (
        <tr key={item.id}>
          <td><strong>{item.request_id}</strong></td>{admin && <td>{item.requester_name}</td>}
          <td>{item.document_type}</td><td>{item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : '-'}</td>
          <td><StatusBadge status={item.status} /></td><td>{item.release_date ? new Date(item.release_date).toLocaleDateString() : '-'}</td>
          <td><button className="link-button" onClick={() => navigate(`${admin ? '/admin/requests' : '/requests'}/${item.request_id}`)}>View</button></td>
        </tr>
      ))}</tbody>
    </table>{items.length === 0 && <div className="empty-state">No requests found.</div>}</div>
  )
}
