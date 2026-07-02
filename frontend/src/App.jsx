import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AssetList from './pages/AssetList';
import AssetCreate from './pages/AssetCreate';
import AssetDetail from './pages/AssetDetail';
import EmployeeList from './pages/EmployeeList';
import MaintenanceList from './pages/MaintenanceList';
import AuditLog from './pages/AuditLog';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assets" element={<AssetList />} />
            <Route path="/assets/new" element={<AssetCreate />} />
            <Route path="/assets/:id" element={<AssetDetail />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/maintenance" element={<MaintenanceList />} />
            <Route path="/audit-log" element={<AuditLog />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
