export default function RequestTimeline({ history = [], request }) {
  return (
    <div className="timeline">
      {history.map((entry, index) => (
        <div className="timeline-item" key={entry.id || index}>
          <div className="timeline-dot" /><div><strong>{entry.new_status}</strong><small>{new Date(entry.changed_at).toLocaleString()}</small>{entry.reason && <p>{entry.reason}</p>}</div>
        </div>
      ))}
      {request?.rejection_reason && <div className="alert error">Rejection Reason: {request.rejection_reason}</div>}
      {request?.cancellation_reason && <div className="alert error">Cancellation Reason: {request.cancellation_reason}</div>}
    </div>
  )
}
