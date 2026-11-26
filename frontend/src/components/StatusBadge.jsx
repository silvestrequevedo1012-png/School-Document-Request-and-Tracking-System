export default function StatusBadge({ status }) {
  const slug = (status || 'pending').toLowerCase().replaceAll(' ', '-')
  return <span className={`status-badge status-${slug}`}>{status}</span>
}
