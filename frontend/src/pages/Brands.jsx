import React, { useState, useEffect } from 'react';
import { Tag, Plus, CheckCircle, X } from 'lucide-react';
import api from '../services/api';

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', country: 'India', popularModels: '' });

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await api.get('/brands');
      if (res.data) setBrands(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/brands', {
        name: formData.name,
        country: formData.country,
        popularModels: formData.popularModels.split(',').map((m) => m.trim()),
      });
      setIsModalOpen(false);
      setFormData({ name: '', country: 'India', popularModels: '' });
      fetchBrands();
    } catch (err) {
      alert(`Failed to add brand: ${err.message}`);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <h3>Supported Car Manufacturers</h3>
          <p>Multi-brand support across domestic and international OEM standards</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>Add Brand</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {brands.map((b) => (
          <div
            key={b._id}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              backgroundColor: '#fff',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                }}
              >
                🚘
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '700' }}>{b.name}</h4>
                <span className="badge badge-blue">{b.country}</span>
              </div>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              <strong>Popular Models:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {(b.popularModels || []).map((m) => (
                  <span
                    key={m}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid var(--border)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Supported Car Brand</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Brand Name * (e.g. Skoda, Volkswagen, Kia)</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Country of Origin</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Popular Models (comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Kushaq, Slavia, Kodiaq"
                    value={formData.popularModels}
                    onChange={(e) => setFormData({ ...formData, popularModels: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Brand</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
