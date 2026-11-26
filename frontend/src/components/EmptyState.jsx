export default function EmptyState({ title = 'Nothing here yet', message = 'There are no records to display.' }) {
  return <div className="empty-state"><h3>{title}</h3><p>{message}</p></div>
}
