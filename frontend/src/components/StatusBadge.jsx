export function StatusBadge({ value }) {
  const normalized = String(value || 'Unknown').replaceAll(' ', '-').toLowerCase();
  return <span className={`status-badge ${normalized}`}>{value || 'Unknown'}</span>;
}
