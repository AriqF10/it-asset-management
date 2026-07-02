import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getDashboard } from '../api/assets';

const STATUS_COLORS = {
  available: '#10b981', assigned: '#3b82f6', in_maintenance: '#f59e0b',
  retired: '#6b7280', lost: '#dc2626',
};
const STATUS_LABELS = {
  available: 'Available', assigned: 'Assigned', in_maintenance: 'In Maintenance',
  retired: 'Retired', lost: 'Lost',
};
const CATEGORY_LABELS = {
  hardware: 'Hardware', software: 'Software', network: 'Network', furniture: 'Furniture', other: 'Other',
};

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getDashboard().then(({ data }) => setData(data));
  }, []);

  if (!data) return <div className="page-loading">Loading dashboard...</div>;

  const statusData = Object.entries(data.by_status).map(([key, value]) => ({
    name: STATUS_LABELS[key], value, key,
  }));
  const categoryData = Object.entries(data.by_category).map(([key, value]) => ({
    name: CATEGORY_LABELS[key], value,
  }));

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-value">{data.total}</span>
          <span className="stat-label">Total Assets</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data.by_status.assigned || 0}</span>
          <span className="stat-label">Assigned</span>
        </div>
        <div className="stat-card stat-card-warning">
          <span className="stat-value">{data.warranty_expiring_soon}</span>
          <span className="stat-label">Warranty Expiring Soon</span>
        </div>
        <div className="stat-card stat-card-danger">
          <span className="stat-value">{data.warranty_expired}</span>
          <span className="stat-label">Warranty Expired</span>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-box">
          <h3>Assets by Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90} label>
                {statusData.map((entry) => (
                  <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-box">
          <h3>Assets by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
