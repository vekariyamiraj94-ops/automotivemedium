import React, { useState, useEffect } from 'react';
import { Package, AlertCircle, Plus, Search, CheckCircle2, X, Edit, Trash2 } from 'lucide-react';
import api from '../services/api';

export default function Inventory() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    partNumber: '',
    name: '',
    category: 'Engine',
    unitCost: 500,
    sellingPrice: 850,
    stockQuantity: 20,
    minReorderThreshold: 5,
    supplier: 'Automotive Genuine Spares Ltd',
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (lowStockOnly) params.lowStock = 'true';
      const res = await api.get('/inventory', { params });
      if (res.data) setParts(res.data);
    } catch (e) {
      console.error(e);
      setAlert({ type: 'error', message: 'Failed to load inventory from backend.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [search, categoryFilter, lowStockOnly]);

  useEffect(() => {
    if (alert.message) {
      const t = setTimeout(() => setAlert({ type: '', message: '' }), 4000);
      return () => clearTimeout(t);
    }
  }, [alert]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      partNumber: '',
      name: '',
      category: 'Engine',
      unitCost: 500,
      sellingPrice: 850,
      stockQuantity: 20,
      minReorderThreshold: 5,
      supplier: 'Automotive Genuine Spares Ltd',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (part) => {
    setEditingId(part._id);
    setFormData({
      partNumber: part.partNumber || '',
      name: part.name || '',
      category: part.category || 'Engine',
      unitCost: part.unitCost || 0,
      sellingPrice: part.sellingPrice || 0,
      stockQuantity: part.stockQuantity || 0,
      minReorderThreshold: part.minReorderThreshold || 5,
      supplier: part.supplier || 'Automotive Genuine Spares Ltd',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/inventory/${editingId}`, formData);
        setAlert({ type: 'success', message: 'Inventory part updated successfully!' });
      } else {
        await api.post('/inventory', formData);
        setAlert({ type: 'success', message: 'New spare part added to inventory!' });
      }
      setIsModalOpen(false);
      fetchInventory();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Operation failed' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from inventory?`)) return;
    try {
      await api.delete(`/inventory/${id}`);
      setAlert({ type: 'success', message: 'Part removed from inventory.' });
      fetchInventory();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Delete failed' });
    }
  };

  const handleStockAdjust = async (part, delta) => {
    const newQty = Math.max(0, (part.stockQuantity || 0) + delta);
    try {
      await api.put(`/inventory/${part._id}`, { stockQuantity: newQty });
      setParts((prev) =>
        prev.map((p) => (p._id === part._id ? { ...p, stockQuantity: newQty } : p))
      );
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to adjust stock' });
    }
  };

  return (
    <div className="card">
      {alert.message && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '16px',
          borderRadius: 'var(--radius-md)',
          background: alert.type === 'success' ? '#ecfdf5' : '#fef2f2',
          color: alert.type === 'success' ? '#065f46' : '#991b1b',
          border: `1px solid ${alert.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
        }}>
          {alert.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{alert.message}</span>
        </div>
      )}

      <div className="card-header">
        <div className="card-title">
          <h3>Spare Parts & Consumables Inventory</h3>
          <p>Real-time stock tracking with automated low-stock reorder triggers</p>
        </div>
        <div className="card-controls">
          <input
            type="text"
            className="search-input"
            placeholder="Search part name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="select-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Engine">Engine</option>
            <option value="Brakes">Brakes</option>
            <option value="Filters">Filters</option>
            <option value="Fluids">Fluids</option>
            <option value="Electrical">Electrical</option>
            <option value="Body">Body</option>
          </select>
          <button
            className={`btn ${lowStockOnly ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => setLowStockOnly(!lowStockOnly)}
          >
            <AlertCircle size={15} />
            <span>{lowStockOnly ? 'Show All' : 'Low Stock Alerts'}</span>
          </button>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add Part</span>
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Part SKU</th>
              <th>Part Name</th>
              <th>Category</th>
              <th>Stock Status</th>
              <th>Cost Price</th>
              <th>Retail Price</th>
              <th>Supplier</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {parts.length > 0 ? (
              parts.map((p) => {
                const isLow = p.stockQuantity <= p.minReorderThreshold;
                return (
                  <tr key={p._id}>
                    <td>
                      <code>{p.partNumber}</code>
                    </td>
                    <td><strong>{p.name}</strong></td>
                    <td>
                      <span className="badge badge-purple">{p.category}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge ${isLow ? 'badge-red' : 'badge-green'}`}>
                          {isLow ? `Low Stock (${p.stockQuantity})` : `${p.stockQuantity} in stock`}
                        </span>
                        <div style={{ display: 'inline-flex', gap: '2px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '2px 6px', fontSize: '11px' }}
                            title="Decrement stock"
                            onClick={() => handleStockAdjust(p, -1)}
                          >
                            -
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '2px 6px', fontSize: '11px' }}
                            title="Increment stock"
                            onClick={() => handleStockAdjust(p, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </td>
                    <td>₹{p.unitCost?.toLocaleString('en-IN')}</td>
                    <td><strong>₹{p.sellingPrice?.toLocaleString('en-IN')}</strong></td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.supplier}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="Edit Part"
                          onClick={() => handleOpenEdit(p)}
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: '#ef4444' }}
                          title="Delete Part"
                          onClick={() => handleDelete(p._id, p.name)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="empty-state">
                  {loading ? 'Loading spare parts from MongoDB...' : 'No inventory items match criteria.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Spare Part' : 'Add Part to Workshop Inventory'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label>Part Number / SKU *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. FLT-AIR-HYU01"
                    value={formData.partNumber}
                    onChange={(e) => setFormData({ ...formData, partNumber: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="form-group">
                  <label>Part Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Premium Cabin Air Filter"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Engine">Engine</option>
                    <option value="Brakes">Brakes</option>
                    <option value="Filters">Filters</option>
                    <option value="Fluids">Fluids</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Body">Body</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Purchase Unit Cost (₹) *</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      value={formData.unitCost}
                      onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Initial Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Min Reorder Threshold *</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      value={formData.minReorderThreshold}
                      onChange={(e) => setFormData({ ...formData, minReorderThreshold: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Supplier Details</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Bosch Authorized Distributor"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update Part' : 'Add Part'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
