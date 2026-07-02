import { useEffect, useState } from 'react';
import { listAuditLogs } from '../api/auditlog';

const ACTION_LABELS = {
  created: 'Created', updated: 'Updated', assigned: 'Assigned', unassigned: 'Unassigned',
  status_changed: 'Status Changed', deleted: 'Deleted', maintenance_logged: 'Maintenance Logged',
};

export default function AuditLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    listAuditLogs().then(({ data }) => setLogs(data.results ?? data));
  }, []);

  return (
    <div>
      <h2>Audit Log</h2>
      <p style={{ color: '#6b7280', marginBottom: 16 }}>
        Every asset change is recorded here and pushed to the SOC dashboard via webhook.
      </p>
      <table className="data-table">
        <thead>
          <tr><th>Action</th><th>Asset</th><th>Actor</th><th>Details</th><th>Webhook</th><th>Time</th></tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const delivery = log.webhook_deliveries[0];
            return (
              <tr key={log.id}>
                <td>{ACTION_LABELS[log.action]}</td>
                <td>{log.asset_tag} — {log.asset_name}</td>
                <td>{log.actor?.username || 'system'}</td>
                <td><code style={{ fontSize: 12 }}>{JSON.stringify(log.details)}</code></td>
                <td>
                  {delivery ? (
                    <span className={`badge badge-webhook-${delivery.status}`}>{delivery.status}</span>
                  ) : '-'}
                </td>
                <td>{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            );
          })}
          {logs.length === 0 && <tr><td colSpan={6} className="empty-row">No audit log entries yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
