export function ChartBarList({ items, labelKey = 'label', valueKey = 'count' }) {
  const max = Math.max(...(items || []).map((item) => Number(item[valueKey] || 0)), 1);

  return (
    <div className="bar-list">
      {(items || []).map((item) => {
        const value = Number(item[valueKey] || 0);
        const width = `${Math.max((value / max) * 100, 6)}%`;

        return (
          <div className="bar-row" key={item[labelKey]}>
            <div className="bar-label">
              <span>{item[labelKey]}</span>
              <strong>{value}</strong>
            </div>
            <div className="bar-track">
              <span style={{ width }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
