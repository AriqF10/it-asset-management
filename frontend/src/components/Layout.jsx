import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1 className="brand">Asset Manager</h1>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/assets">Assets</NavLink>
          <NavLink to="/employees">Employees</NavLink>
          <NavLink to="/maintenance">Maintenance</NavLink>
          {isAdmin && <NavLink to="/audit-log">Audit Log</NavLink>}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <strong>{user?.username}</strong>
            <span className="role-badge">{user?.role}</span>
          </div>
          <button onClick={logout} className="btn-link">Logout</button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
