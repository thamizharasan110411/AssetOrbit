import { Filter, RotateCcw, Search } from 'lucide-react';

export function FilterPanel({ filters, categories = [], onChange, onReset }) {
  const activeFilterCount = [
    filters.search,
    filters.category_id,
    filters.status,
    filters.warranty_status,
    filters.sort_by && filters.sort_by !== 'created_at',
    filters.sort_direction && filters.sort_direction !== 'desc'
  ].filter(Boolean).length;

  const update = (field, value) => {
    onChange({
      ...filters,
      [field]: value,
      page: 1
    });
  };

  return (
    <section className="filter-panel" aria-labelledby="asset-filter-title">
      <div className="filter-panel-heading">
        <span className="filter-heading-icon">
          <Filter size={16} aria-hidden="true" />
        </span>
        <div>
          <strong id="asset-filter-title">Filter assets</strong>
          <span>{activeFilterCount ? `${activeFilterCount} active` : 'All records'}</span>
        </div>
      </div>

      <label className="filter-control filter-search">
        <span>Search</span>
        <span className="search-field">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            value={filters.search || ''}
            onChange={(event) => update('search', event.target.value)}
            placeholder="Name, code, serial, owner"
          />
        </span>
      </label>

      <label className="filter-control">
        <span>Category</span>
        <select value={filters.category_id || ''} onChange={(event) => update('category_id', event.target.value)}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.category_name}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-control">
        <span>Status</span>
        <select value={filters.status || ''} onChange={(event) => update('status', event.target.value)}>
          <option value="">All statuses</option>
          <option>Available</option>
          <option>Assigned</option>
          <option>Under Maintenance</option>
          <option>Retired</option>
        </select>
      </label>

      <label className="filter-control">
        <span>Warranty</span>
        <select
          value={filters.warranty_status || ''}
          onChange={(event) => update('warranty_status', event.target.value)}
        >
          <option value="">Any warranty</option>
          <option value="active">Active</option>
          <option value="expiring">Expiring soon</option>
          <option value="expired">Expired</option>
          <option value="none">No warranty</option>
        </select>
      </label>

      <label className="filter-control">
        <span>Sort by</span>
        <select value={filters.sort_by || 'created_at'} onChange={(event) => update('sort_by', event.target.value)}>
          <option value="created_at">Date added</option>
          <option value="purchase_date">Purchase date</option>
          <option value="warranty_end">Warranty date</option>
          <option value="purchase_cost">Asset value</option>
          <option value="asset_name">Asset name</option>
        </select>
      </label>

      <label className="filter-control">
        <span>Order</span>
        <select value={filters.sort_direction || 'desc'} onChange={(event) => update('sort_direction', event.target.value)}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </label>

      <button
        className="btn btn-outline-secondary icon-text filter-reset"
        type="button"
        disabled={!activeFilterCount}
        onClick={onReset}
      >
        <RotateCcw size={16} aria-hidden="true" />
        Reset
      </button>
    </section>
  );
}
