import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listAssets } from '../api/assets';

const STATUS_LABELS = {
  available: 'Available', assigned: 'Assigned', in_maintenance: 'In Maintenance',
  retired: 'Retired', lost: 'Lost',
};
const CATEGORY_LABELS = {
  hardware: 'Hardware', software: 'Software', network: 'Network', furniture: 'Furniture', other: 'Other',
};

export default function AssetList() {
  const [assets, setAssets] = useState([]);
  const [filters, setFilters] = useState({ status: '', category: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.category) params.category = filters.category;
    listAssets(params)
      .then(({ data }) => setAssets(data.results ?? data))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div>
      <div className="page-header">
        <h2>Assets</h2>
        <Link to="/assets/new" className="btn-primary">+ Add Asset</Link>
      </div>

      <div className="filters">
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Tag</th><th>Name</th><th>Category</th><th>Status</th><th>Assigned To</th><th>Warranty</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.id}>
                <td><Link to={`/assets/${a.id}`}>{a.asset_tag}</Link></td>
                <td><Link to={`/assets/${a.id}`}>{a.name}</Link></td>
                <td>{CATEGORY_LABELS[a.category]}</td>
                <td><span className={`badge badge-${a.status}`}>{STATUS_LABELS[a.status]}</span></td>
                <td>{a.assigned_to?.name || '-'}</td>
                <td>
                  {a.is_warranty_expired ? <span className="sla-breach">Expired</span> :
                   a.is_warranty_expiring_soon ? <span className="warranty-warning">Expiring soon</span> :
                   a.warranty_expiry || '-'}
                </td>
              </tr>
            ))}
            {assets.length === 0 && (
              <tr><td colSpan={6} className="empty-row">No assets found.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
