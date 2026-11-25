import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Clock, Tag, X } from 'lucide-react';
import api from '../services/api';

export default function Services() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Periodic Maintenance',
    description: '',
    basePrice: 2999,
    estimatedDurationHours: 2.5,
  });

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/service-packages');
      if (res.data) setPackages(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/service-packages', formData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        category: 'Periodic Maintenance',
        description: '',
        basePrice: 2999,
        estimatedDurationHours: 2.5,
      });
      fetchPackages();
    } catch (err) {
      alert(`Failed to add package: ${err.message}`);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <h3>Service Packages & Labour Catalog</h3>
          <p>Standardized service tiers, maintenance schedules and estimated bay hours</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>New Service Package</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {packages.map((pkg) => (
          <div
            key={pkg._id}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              backgroundColor: '#fff',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span className="badge badge-purple">{pkg.category}</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>
                  ₹{(pkg.basePrice || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>{pkg.name}</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {pkg.description || 'Comprehensive inspection and maintenance package.'}
              </p>
            </div>
            <div
              style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: 'var(--text-muted)',
              }}
            >
              <Clock size={13} />
              <span>Duration: ~{pkg.estimatedDurationHours || 2} hours</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Service Package</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Service Package Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Complete Monsoon Care"
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
                    <option value="Periodic Maintenance">Periodic Maintenance</option>
                    <option value="Brake Service">Brake Service</option>
                    <option value="Engine Diagnostic">Engine Diagnostic</option>
                    <option value="AC Service">AC Service</option>
                    <option value="Wheel Alignment">Wheel Alignment</option>
                    <option value="Body Repair & Detailing">Body Repair & Detailing</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Base Price (₹) *</label>
                  <input
                    type="number"
                    required
                    className="form-control"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Estimated Bay Duration (Hours) *</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-control"
                    value={formData.estimatedDurationHours}
                    onChange={(e) => setFormData({ ...formData, estimatedDurationHours: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows="2"
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Package</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
