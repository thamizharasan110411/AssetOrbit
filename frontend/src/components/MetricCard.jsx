export function MetricCard({ title, value, icon: Icon, tone = 'blue', detail }) {
  return (
    <article className={`metric-card ${tone}`}>
      <div className="metric-icon">{Icon ? <Icon size={22} /> : null}</div>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
        {detail ? <small>{detail}</small> : null}
      </div>
    </article>
  );
}
