import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Clock, Tag, X, Edit, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function Services() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });

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
      setAlert({ type: 'error', message: 'Failed to load service packages.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    if (alert.message) {
      const t = setTimeout(() => setAlert({ type: '', message: '' }), 4000);
      return () => clearTimeout(t);
    }
  }, [alert]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category: 'Periodic Maintenance',
      description: '',
      basePrice: 2999,
      estimatedDurationHours: 2.5,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg) => {
    setEditingId(pkg._id);
    setFormData({
      name: pkg.name || '',
      category: pkg.category || 'Periodic Maintenance',
      description: pkg.description || '',
      basePrice: pkg.basePrice || 1999,
      estimatedDurationHours: pkg.estimatedDurationHours || 2,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/service-packages/${editingId}`, formData);
        setAlert({ type: 'success', message: 'Service package updated successfully!' });
      } else {
        await api.post('/service-packages', formData);
        setAlert({ type: 'success', message: 'New service package created!' });
      }
      setIsModalOpen(false);
      fetchPackages();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Operation failed' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate package "${name}"?`)) return;
    try {
      await api.delete(`/service-packages/${id}`);
      setAlert({ type: 'success', message: 'Service package deactivated.' });
      fetchPackages();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Deactivation failed' });
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
          <h3>Service Packages & Labour Catalog</h3>
          <p>Standardized service tiers, maintenance schedules and estimated bay hours</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
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
                {pkg.description || 'Comprehensive multi-brand inspection and maintenance package.'}
              </p>
            </div>
            
            <div
              style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                color: 'var(--text-muted)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={13} />
                <span>Duration: ~{pkg.estimatedDurationHours || 2} hours</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 8px' }}
                  title="Edit Package"
                  onClick={() => handleOpenEdit(pkg)}
                >
                  <Edit size={13} />
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 8px', color: '#ef4444' }}
                  title="Deactivate Package"
                  onClick={() => handleDelete(pkg._id, pkg.name)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Service Package' : 'Create Service Package'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                    placeholder="Package inclusions and inspection checklists"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update Package' : 'Save Package'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
