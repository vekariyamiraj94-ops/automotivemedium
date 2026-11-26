import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, Phone, MapPin, X, Edit, Trash2, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Mumbai',
    address: '',
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers', { params: { search } });
      if (res.data) setCustomers(res.data);
    } catch (e) {
      console.error(e);
      setAlert({ type: 'error', message: 'Failed to load customers from backend.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  useEffect(() => {
    if (alert.message) {
      const t = setTimeout(() => setAlert({ type: '', message: '' }), 4000);
      return () => clearTimeout(t);
    }
  }, [alert]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', city: 'Mumbai', address: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingId(c._id);
    setFormData({
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      city: c.city || 'Mumbai',
      address: c.address || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, formData);
        setAlert({ type: 'success', message: 'Customer updated successfully!' });
      } else {
        await api.post('/customers', formData);
        setAlert({ type: 'success', message: 'Customer registered successfully!' });
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Operation failed' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove customer "${name}"?`)) return;
    try {
      await api.delete(`/customers/${id}`);
      setAlert({ type: 'success', message: 'Customer deleted successfully.' });
      fetchCustomers();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to delete customer' });
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
          <h3>Customer Relationship Management (CRM)</h3>
          <p>Verified car owners, contact directory and service communication</p>
        </div>
        <div className="card-controls">
          <input
            type="text"
            className="search-input"
            placeholder="Search name, email, phone or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Contact Phone</th>
              <th>Email</th>
              <th>City</th>
              <th>Address</th>
              <th>Registered</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((c) => (
                <tr key={c._id}>
                  <td><strong>{c.name}</strong></td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={13} color="var(--primary)" />
                      {c.phone}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={13} color="var(--text-muted)" />
                      {c.email}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-blue">{c.city}</span>
                  </td>
                  <td style={{ maxWidth: '200px', fontSize: '12px' }}>{c.address || 'N/A'}</td>
                  <td>
                    {new Date(c.createdAt || Date.now()).toLocaleDateString('en-IN', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px' }}
                        title="Edit Customer"
                        onClick={() => handleOpenEdit(c)}
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', color: '#ef4444' }}
                        title="Delete Customer"
                        onClick={() => handleDelete(c._id, c.name)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-state">
                  {loading ? 'Loading customers from MongoDB...' : 'No customers found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Customer Details' : 'Register New Customer'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Anand Mahindra"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    className="form-control"
                    placeholder="e.g. anand@mahindra.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="+91 98765 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Mumbai"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    rows="2"
                    className="form-control"
                    placeholder="Workshop delivery or billing address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update Customer' : 'Save Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
