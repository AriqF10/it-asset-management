import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assignAsset, deleteAsset, getAsset, unassignAsset, updateAsset } from '../api/assets';
import { listEmployees } from '../api/assets';
import { createMaintenanceRecord } from '../api/maintenance';
import { useAuth } from '../context/AuthContext';

const STATUS_LABELS = {
  available: 'Available', assigned: 'Assigned', in_maintenance: 'In Maintenance',
  retired: 'Retired', lost: 'Lost',
};
const CATEGORY_LABELS = {
  hardware: 'Hardware', software: 'Software', network: 'Network', furniture: 'Furniture', other: 'Other',
};

export default function AssetDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [maintenanceForm, setMaintenanceForm] = useState({ type: 'scheduled', status: 'planned', description: '' });
  const isAdmin = user?.role === 'admin';

  const load = () => getAsset(id).then(({ data }) => setAsset(data));

  useEffect(() => {
    load();
    listEmployees({ is_active: true }).then(({ data }) => setEmployees(data.results ?? data));
  }, [id]);

  if (!asset) return <div className="page-loading">Loading...</div>;

  const handleStatusChange = async (e) => {
    await updateAsset(id, { status: e.target.value });
    load();
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    await assignAsset(id, { employee_id: selectedEmployee });
    setSelectedEmployee('');
    load();
  };

  const handleUnassign = async () => {
    await unassignAsset(id);
    load();
  };

  const handleDelete = async () => {
    if (!confirm('Delete this asset? This cannot be undone.')) return;
    await deleteAsset(id);
    navigate('/assets');
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    await createMaintenanceRecord({ asset: id, ...maintenanceForm });
    setMaintenanceForm({ type: 'scheduled', status: 'planned', description: '' });
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h2>{asset.asset_tag} — {asset.name}</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <span className={`badge badge-${asset.status}`}>{STATUS_LABELS[asset.status]}</span>
          {isAdmin && <button onClick={handleDelete} className="btn-danger">Delete</button>}
        </div>
      </div>

      <div className="ticket-meta">
        <span><strong>Category:</strong> {CATEGORY_LABELS[asset.category]}</span>
        <span><strong>Serial:</strong> {asset.serial_number || '-'}</span>
        <span><strong>Brand/Model:</strong> {asset.brand} {asset.model_name}</span>
        <span><strong>Location:</strong> {asset.location || '-'}</span>
        <span><strong>Assigned To:</strong> {asset.assigned_to?.name || 'Unassigned'}</span>
        <span className={asset.is_warranty_expired ? 'sla-breach' : asset.is_warranty_expiring_soon ? 'warranty-warning' : ''}>
          <strong>Warranty:</strong> {asset.warranty_expiry || '-'}
        </span>
      </div>

      {asset.notes && <p className="ticket-description">{asset.notes}</p>}

      <div className="staff-controls">
        <label>
          Change Status
          <select value={asset.status} onChange={handleStatusChange}>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
      </div>

      <h3>Assignment</h3>
      {asset.assigned_to ? (
        <div className="upload-form">
          <span>Currently assigned to <strong>{asset.assigned_to.name}</strong></span>
          <button onClick={handleUnassign}>Unassign</button>
        </div>
      ) : (
        <form onSubmit={handleAssign} className="upload-form">
          <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
            <option value="">-- Select employee --</option>
            {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
          </select>
          <button type="submit" disabled={!selectedEmployee}>Assign</button>
        </form>
      )}

      <h3>Assignment History</h3>
      <ul className="comment-list">
        {asset.assignments.map((a) => (
          <li key={a.id}>
            <div className="comment-head">
              <strong>{a.employee.name}</strong>
              <span>{new Date(a.assigned_at).toLocaleDateString()} {a.returned_at ? `→ ${new Date(a.returned_at).toLocaleDateString()}` : '(current)'}</span>
            </div>
          </li>
        ))}
        {asset.assignments.length === 0 && <li className="empty-row">No assignment history.</li>}
      </ul>

      <h3>Maintenance Records</h3>
      <ul className="comment-list">
        {asset.maintenance_records.map((m) => (
          <li key={m.id}>
            <div className="comment-head">
              <strong>{m.type} — {m.status}</strong>
              <span>{new Date(m.created_at).toLocaleDateString()}</span>
            </div>
            <p>{m.description}</p>
          </li>
        ))}
        {asset.maintenance_records.length === 0 && <li className="empty-row">No maintenance records.</li>}
      </ul>
      <form onSubmit={handleMaintenanceSubmit} className="comment-form">
        <div className="staff-controls">
          <label>
            Type
            <select value={maintenanceForm.type} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, type: e.target.value })}>
              <option value="scheduled">Scheduled Maintenance</option>
              <option value="repair">Repair</option>
              <option value="calibration">Calibration</option>
            </select>
          </label>
          <label>
            Status
            <select value={maintenanceForm.status} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, status: e.target.value })}>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </label>
        </div>
        <textarea rows={3} placeholder="Description..." value={maintenanceForm.description} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })} required />
        <button type="submit">Log Maintenance</button>
      </form>
    </div>
  );
}
