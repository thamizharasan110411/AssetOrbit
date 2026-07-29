export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(new Date(value));
}

export function toDateInput(value) {
  if (!value) {
    return '';
  }

  return new Date(value).toISOString().slice(0, 10);
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function getWarrantyState(asset) {
  if (!asset?.warranty_end) {
    return 'No Warranty';
  }

  const end = new Date(asset.warranty_end);
  const now = new Date();
  const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return 'Expired';
  }

  if (days <= 30) {
    return 'Expiring Soon';
  }

  return 'Active';
}

export function exportCsv(filename, rows) {
  if (!rows?.length) {
    return;
  }

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? '';
          return `"${String(value).replaceAll('"', '""')}"`;
        })
        .join(',')
    )
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
