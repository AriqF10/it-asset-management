import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listMaintenanceRecords } from '../api/maintenance';

const STATUS_LABELS = { planned: 'Planned', in_progress: 'In Progress', completed: 'Completed' };
const TYPE_LABELS = { scheduled: 'Scheduled', repair: 'Repair', calibration: 'Calibration' };

export default function MaintenanceList() {
  const [records, setRecords] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    listMaintenanceRecords(statusFilter ? { status: statusFilter } : {})
      .then(({ data }) => setRecords(data.results ?? data));
  }, [statusFilter]);

  return (
    <div>
      <h2>Maintenance Records</h2>
      <div className="filters">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <table className="data-table">
        <thead>
          <tr><th>Asset</th><th>Type</th><th>Status</th><th>Scheduled</th><th>Completed</th><th>Next Due</th></tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td><Link to={`/assets/${r.asset}`}>{r.asset}</Link></td>
              <td>{TYPE_LABELS[r.type]}</td>
              <td><span className={`badge badge-maint-${r.status}`}>{STATUS_LABELS[r.status]}</span></td>
              <td>{r.scheduled_date || '-'}</td>
              <td>{r.completed_date || '-'}</td>
              <td>{r.next_due_date || '-'}</td>
            </tr>
          ))}
          {records.length === 0 && <tr><td colSpan={6} className="empty-row">No maintenance records.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
