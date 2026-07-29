import { Filter, RotateCcw, Search } from 'lucide-react';

export function FilterPanel({ filters, categories = [], onChange, onReset }) {
  const update = (field, value) => {
    onChange({
      ...filters,
      [field]: value,
      page: 1
    });
  };

  return (
    <section className="filter-panel">
      <div className="search-field">
        <Search size={18} />
        <input
          type="search"
          value={filters.search || ''}
          onChange={(event) => update('search', event.target.value)}
          placeholder="Search assets, serials, vendors, employees"
        />
      </div>
      <select value={filters.category_id || ''} onChange={(event) => update('category_id', event.target.value)}>
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.category_name}
          </option>
        ))}
      </select>
      <select value={filters.status || ''} onChange={(event) => update('status', event.target.value)}>
        <option value="">All statuses</option>
        <option>Available</option>
        <option>Assigned</option>
        <option>Under Maintenance</option>
        <option>Retired</option>
      </select>
      <select
        value={filters.warranty_status || ''}
        onChange={(event) => update('warranty_status', event.target.value)}
      >
        <option value="">Warranty status</option>
        <option value="active">Active</option>
        <option value="expiring">Expiring soon</option>
        <option value="expired">Expired</option>
        <option value="none">No warranty</option>
      </select>
      <select value={filters.sort_by || 'created_at'} onChange={(event) => update('sort_by', event.target.value)}>
        <option value="created_at">Recently added</option>
        <option value="purchase_date">Purchase date</option>
        <option value="warranty_end">Warranty date</option>
        <option value="purchase_cost">Asset value</option>
        <option value="asset_name">Asset name</option>
      </select>
      <button className="btn btn-outline-secondary icon-text" type="button" onClick={onReset}>
        <RotateCcw size={16} />
        Reset
      </button>
      <span className="filter-chip">
        <Filter size={14} />
        Filters
      </span>
    </section>
  );
}
