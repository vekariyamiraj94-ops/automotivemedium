import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Wrench, Users, Plus, Edit, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function ServiceCentres() {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    city: 'Mumbai',
    address: '',
    phone: '',
    email: '',
    capacityBays: 12,
    activeMechanics: 8,
  });

  const fetchCentres = async () => {
    try {
      setLoading(true);
      const res = await api.get('/service-centres');
      if (res.data) setCentres(res.data);
    } catch (e) {
      console.error(e);
      setAlert({ type: 'error', message: 'Failed to load service centres.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCentres();
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
      code: `SC-${Math.floor(100 + Math.random() * 900)}`,
      city: 'Mumbai',
      address: '',
      phone: '',
      email: '',
      capacityBays: 12,
      activeMechanics: 8,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingId(c._id);
    setFormData({
      name: c.name || '',
      code: c.code || '',
      city: c.city || 'Mumbai',
      address: c.address || '',
      phone: c.phone || '',
      email: c.email || '',
      capacityBays: c.capacityBays || 10,
      activeMechanics: c.activeMechanics || 6,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/service-centres/${editingId}`, formData);
        setAlert({ type: 'success', message: 'Service centre updated successfully!' });
      } else {
        await api.post('/service-centres', formData);
        setAlert({ type: 'success', message: 'New service centre facility added!' });
      }
      setIsModalOpen(false);
      fetchCentres();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Operation failed' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate centre "${name}"?`)) return;
    try {
      await api.delete(`/service-centres/${id}`);
      setAlert({ type: 'success', message: 'Service centre deactivated.' });
      fetchCentres();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to deactivate centre' });
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
          <h3>Workshop Network & Branch Facilities</h3>
          <p>Multi-location service network across major Indian metropolitan hubs</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add Service Centre</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {centres.map((c) => (
          <div
            key={c._id}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              backgroundColor: '#fff',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="badge badge-blue">{c.city}</span>
              <code>{c.code}</code>
            </div>
            <h4 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>{c.name}</h4>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={14} color="var(--primary)" />
                <span>{c.address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="var(--primary)" />
                <span>{c.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} color="var(--primary)" />
                <span>{c.email}</span>
              </div>
            </div>

            <div
              style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                textAlign: 'center',
              }}
            >
              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Service Bays</div>
                <div style={{ fontSize: '18px', fontWeight: '800' }}>{c.capacityBays}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mechanics</div>
                <div style={{ fontSize: '18px', fontWeight: '800' }}>{c.activeMechanics}</div>
              </div>
            </div>

            <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 10px', fontSize: '12px' }}
                onClick={() => handleOpenEdit(c)}
              >
                <Edit size={12} style={{ marginRight: '4px' }} />
                Edit
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 10px', fontSize: '12px', color: '#ef4444' }}
                onClick={() => handleDelete(c._id, c.name)}
              >
                <Trash2 size={12} style={{ marginRight: '4px' }} />
                Deactivate
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Service Centre' : 'Add New Service Centre'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label>Facility Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Surat Ring Road Hub"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Centre Code *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. SC-SUR-06"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Surat"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Workshop Address *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Plot 45, GIDC Industrial Estate"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="+91 98200 99887"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      required
                      className="form-control"
                      placeholder="surat@automotivemedium.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Bay Capacity (Lifts) *</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      value={formData.capacityBays}
                      onChange={(e) => setFormData({ ...formData, capacityBays: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Active Mechanics *</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      value={formData.activeMechanics}
                      onChange={(e) => setFormData({ ...formData, activeMechanics: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update Centre' : 'Save Centre'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
