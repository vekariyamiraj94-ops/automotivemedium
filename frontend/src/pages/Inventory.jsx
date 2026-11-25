import React, { useState, useEffect } from 'react';
import { Package, AlertCircle, Plus, Search, CheckCircle2, X } from 'lucide-react';
import api from '../services/api';

export default function Inventory() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [search, categoryFilter, lowStockOnly]);

  const handleCreatePart = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory', formData);
      setIsModalOpen(false);
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
      fetchInventory();
    } catch (err) {
      alert(`Failed to add part: ${err.message}`);
    }
  };

  return (
    <div className="card">
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
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
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
                      <span className={`badge ${isLow ? 'badge-red' : 'badge-green'}`}>
                        {isLow ? `Low Stock (${p.stockQuantity} left)` : `${p.stockQuantity} units`}
                      </span>
                    </td>
                    <td>₹{p.unitCost?.toLocaleString('en-IN')}</td>
                    <td><strong>₹{p.sellingPrice?.toLocaleString('en-IN')}</strong></td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.supplier}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="empty-state">
                  {loading ? 'Loading spare parts...' : 'No inventory items match criteria.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Part to Workshop Inventory</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreatePart}>
              <div className="modal-body">
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Unit Cost (₹) *</label>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Initial Stock Qty *</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Reorder Threshold</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.minReorderThreshold}
                      onChange={(e) => setFormData({ ...formData, minReorderThreshold: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Part</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
