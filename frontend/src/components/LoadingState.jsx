export function LoadingState({ label = 'Loading data' }) {
  return (
    <div className="loading-state">
      <div className="spinner-border spinner-border-sm" role="status" />
      <span>{label}</span>
    </div>
  );
}
