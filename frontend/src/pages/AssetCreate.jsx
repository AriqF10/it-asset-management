import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAsset } from '../api/assets';

export default function AssetCreate() {
  const [form, setForm] = useState({
    name: '', category: 'hardware', asset_tag: '', serial_number: '', brand: '',
    model_name: '', location: '', purchase_date: '', purchase_cost: '', warranty_expiry: '', notes: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.purchase_date) delete payload.purchase_date;
      if (!payload.purchase_cost) delete payload.purchase_cost;
      if (!payload.warranty_expiry) delete payload.warranty_expiry;
      const { data } = await createAsset(payload);
      navigate(`/assets/${data.id}`);
    } catch (err) {
      const data = err.response?.data;
      setError(data ? Object.values(data).flat().join(' ') : 'Failed to create asset.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Add Asset</h2>
      <form className="form-card" onSubmit={handleSubmit}>
        {error && <p className="error-text">{error}</p>}
        <label>Name<input value={form.name} onChange={update('name')} required /></label>
        <label>Asset Tag<input value={form.asset_tag} onChange={update('asset_tag')} required placeholder="e.g. LAP-0012" /></label>
        <label>
          Category
          <select value={form.category} onChange={update('category')}>
            <option value="hardware">Hardware</option>
            <option value="software">Software</option>
            <option value="network">Network Equipment</option>
            <option value="furniture">Furniture</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>Serial Number<input value={form.serial_number} onChange={update('serial_number')} /></label>
        <label>Brand<input value={form.brand} onChange={update('brand')} /></label>
        <label>Model<input value={form.model_name} onChange={update('model_name')} /></label>
        <label>Location<input value={form.location} onChange={update('location')} /></label>
        <label>Purchase Date<input type="date" value={form.purchase_date} onChange={update('purchase_date')} /></label>
        <label>Purchase Cost<input type="number" step="0.01" value={form.purchase_cost} onChange={update('purchase_cost')} /></label>
        <label>Warranty Expiry<input type="date" value={form.warranty_expiry} onChange={update('warranty_expiry')} /></label>
        <label>Notes<textarea rows={3} value={form.notes} onChange={update('notes')} /></label>
        <button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Asset'}</button>
      </form>
    </div>
  );
}
