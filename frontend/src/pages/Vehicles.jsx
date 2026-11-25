import React, { useState, useEffect } from 'react';
import { Car, Plus, Search, Filter, X } from 'lucide-react';
import api from '../services/api';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    regNumber: '',
    brand: '',
    model: '',
    year: 2023,
    fuelType: 'Petrol',
    customer: '',
    mileageKm: 25000,
    chassisNumber: '',
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (brandFilter) params.brand = brandFilter;
      const res = await api.get('/vehicles', { params });
      if (res.data) setVehicles(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [search, brandFilter]);

  useEffect(() => {
    Promise.allSettled([api.get('/brands'), api.get('/customers')]).then(
      ([bRes, cRes]) => {
        if (bRes.status === 'fulfilled' && bRes.value.data) setBrands(bRes.value.data);
        if (cRes.status === 'fulfilled' && cRes.value.data) setCustomers(cRes.value.data);
      }
    );
  }, []);

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vehicles', formData);
      setIsModalOpen(false);
      setFormData({
        regNumber: '',
        brand: '',
        model: '',
        year: 2023,
        fuelType: 'Petrol',
        customer: '',
        mileageKm: 25000,
        chassisNumber: '',
      });
      fetchVehicles();
    } catch (err) {
      alert(`Vehicle registration failed: ${err.message}`);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <h3>Multi-Brand Vehicle Fleet</h3>
          <p>Register and track customer cars across Maruti, Hyundai, Tata, Mahindra, Toyota & Honda</p>
        </div>
        <div className="card-controls">
          <input
            type="text"
            className="search-input"
            placeholder="Search reg # or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="select-filter"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Registration #</th>
              <th>Brand & Model</th>
              <th>Year</th>
              <th>Fuel Type</th>
              <th>Owner / Customer</th>
              <th>Mileage (KM)</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length > 0 ? (
              vehicles.map((v) => (
                <tr key={v._id}>
                  <td>
                    <code style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontWeight: '700' }}>
                      {v.regNumber}
                    </code>
                  </td>
                  <td>
                    <strong>{v.brand?.name}</strong> {v.model}
                  </td>
                  <td>{v.year}</td>
                  <td>
                    <span className="badge badge-blue">{v.fuelType}</span>
                  </td>
                  <td>
                    <div>{v.customer?.name || 'N/A'}</div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {v.customer?.phone}
                    </span>
                  </td>
                  <td>{v.mileageKm?.toLocaleString('en-IN')} km</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">
                  {loading ? 'Loading vehicles...' : 'No vehicles found.'}
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
              <h3>Register Customer Car</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateVehicle}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Registration Number * (e.g. MH02-AB-1234)</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.regNumber}
                    onChange={(e) => setFormData({ ...formData, regNumber: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="form-group">
                  <label>Brand *</label>
                  <select
                    required
                    className="form-control"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  >
                    <option value="">Select Brand...</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Model Name * (e.g. Swift, Creta, Nexon)</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Fuel Type *</label>
                  <select
                    className="form-control"
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="EV">EV (Electric)</option>
                    <option value="CNG">CNG</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Owner / Customer *</label>
                  <select
                    required
                    className="form-control"
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  >
                    <option value="">Select Customer...</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
