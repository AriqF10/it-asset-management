import { useEffect, useState } from 'react';
import { createEmployee, listEmployees } from '../api/assets';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', department: '', position: '' });
  const [showForm, setShowForm] = useState(false);

  const load = () => listEmployees().then(({ data }) => setEmployees(data.results ?? data));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createEmployee(form);
    setForm({ name: '', email: '', department: '', position: '' });
    setShowForm(false);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h2>Employees</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Employee'}
        </button>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
          <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
          <label>Department<input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></label>
          <label>Position<input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></label>
          <button type="submit">Save Employee</button>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Department</th><th>Position</th><th>Assets Held</th></tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.department || '-'}</td>
              <td>{emp.position || '-'}</td>
              <td>{emp.assets?.length ?? '-'}</td>
            </tr>
          ))}
          {employees.length === 0 && <tr><td colSpan={5} className="empty-row">No employees yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
