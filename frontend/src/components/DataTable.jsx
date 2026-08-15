import { EmptyState } from './EmptyState.jsx';
import { LoadingState } from './LoadingState.jsx';

export function DataTable({ columns, rows, loading, emptyTitle = 'No records found', label = 'Data table' }) {
  if (loading) {
    return <LoadingState />;
  }

  if (!rows?.length) {
    return <EmptyState title={emptyTitle} />;
  }

  return (
    <div className="table-responsive data-table-wrap">
      <table className="table data-table align-middle" aria-label={label}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id || row.asset_code || row.email || rowIndex}>
              {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
