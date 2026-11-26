import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  X,
} from 'lucide-react';
import api from '../services/api';

const ALL_STATUSES = [
  'Booked',
  'Inspection',
  'In Progress',
  'Parts Replacement',
  'Ready',
  'Completed',
  'Cancelled',
];

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for creating a new booking
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [centres, setCentres] = useState([]);
  const [packages, setPackages] = useState([]);
  const [formData, setFormData] = useState({
    customer: '',
    vehicle: '',
    serviceCentre: '',
    servicePackages: [],
    priority: 'Medium',
    scheduledDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await api.get('/bookings', { params });
      if (res.data) setBookings(res.data);
    } catch (err) {
      console.error('Fetch bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, search]);

  useEffect(() => {
    // Preload relation catalogs for creation modal
    Promise.allSettled([
      api.get('/customers'),
      api.get('/vehicles'),
      api.get('/service-centres'),
      api.get('/service-packages'),
    ]).then(([custRes, vehRes, cenRes, pkgRes]) => {
      if (custRes.status === 'fulfilled' && custRes.value.data) setCustomers(custRes.value.data);
      if (vehRes.status === 'fulfilled' && vehRes.value.data) setVehicles(vehRes.value.data);
      if (cenRes.status === 'fulfilled' && cenRes.value.data) setCentres(cenRes.value.data);
      if (pkgRes.status === 'fulfilled' && pkgRes.value.data) setPackages(pkgRes.value.data);
    });
  }, []);

  const handleUpdateStatus = async () => {
    if (!selectedBooking || !newStatus) return;
    try {
      await api.put(`/bookings/${selectedBooking._id}`, { status: newStatus });
      setIsStatusModalOpen(false);
      fetchBookings();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleCancelBooking = async (id, num) => {
    if (!window.confirm(`Are you sure you want to cancel booking ${num}?`)) return;
    try {
      await api.put(`/bookings/${id}`, { status: 'Cancelled' });
      fetchBookings();
    } catch (err) {
      alert(`Failed to cancel booking: ${err.message}`);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bookings', {
        ...formData,
        labourCost: 2500,
        totalAmount: 2500,
      });
      setIsAddModalOpen(false);
      fetchBookings();
    } catch (err) {
      alert(`Booking creation failed: ${err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return 'badge-green';
      case 'In Progress': return 'badge-blue';
      case 'Parts Replacement': return 'badge-amber';
      case 'Inspection': return 'badge-purple';
      case 'Booked': return 'badge-cyan';
      default: return 'badge-red';
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <h3>Service Bookings & Job Cards</h3>
            <p>Manage workshop flow from intake inspection to delivery</p>
          </div>
          <div className="card-controls">
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search booking #..."
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={16} />
              <span>New Booking</span>
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Booking #</th>
                <th>Vehicle</th>
                <th>Owner / Customer</th>
                <th>Service Centre</th>
                <th>Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Total Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((b) => (
                  <tr key={b._id}>
                    <td><strong>{b.bookingNumber}</strong></td>
                    <td>
                      <div>
                        <strong>{b.vehicle?.brand?.name} {b.vehicle?.model}</strong>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {b.vehicle?.regNumber}
                      </span>
                    </td>
                    <td>
                      <div>{b.customer?.name}</div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {b.customer?.phone}
                      </span>
                    </td>
                    <td>{b.serviceCentre?.name || 'Central Hub'}</td>
                    <td>
                      {new Date(b.scheduledDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <span className={`badge ${b.priority === 'Urgent' ? 'badge-red' : b.priority === 'High' ? 'badge-amber' : 'badge-blue'}`}>
                        {b.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td><strong>₹{(b.totalAmount || 0).toLocaleString('en-IN')}</strong></td>
                    <td>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSelectedBooking(b);
                            setNewStatus(b.status);
                            setIsStatusModalOpen(true);
                          }}
                        >
                          <Edit size={13} />
                          <span>Advance</span>
                        </button>
                        {b.status !== 'Cancelled' && b.status !== 'Completed' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#ef4444' }}
                            title="Cancel Booking"
                            onClick={() => handleCancelBooking(b._id, b.bookingNumber)}
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="empty-state">
                    {loading ? 'Loading service bookings...' : 'No bookings found matching filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advance Stage Modal */}
      {isStatusModalOpen && selectedBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Advance Service Stage for {selectedBooking.bookingNumber}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsStatusModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>
                Vehicle: <strong>{selectedBooking.vehicle?.brand?.name} {selectedBooking.vehicle?.model}</strong> ({selectedBooking.vehicle?.regNumber})
              </p>
              <div className="form-group">
                <label>Select Current Workflow Stage:</label>
                <select
                  className="form-control"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsStatusModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdateStatus}>Update Stage</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Booking Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Book New Car Service Intake</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsAddModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateBooking}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Customer *</label>
                  <select
                    className="form-control"
                    required
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  >
                    <option value="">Select Customer...</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Vehicle *</label>
                  <select
                    className="form-control"
                    required
                    value={formData.vehicle}
                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                  >
                    <option value="">Select Vehicle...</option>
                    {vehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.brand?.name || 'Car'} {v.model} ({v.regNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Service Centre *</label>
                  <select
                    className="form-control"
                    required
                    value={formData.serviceCentre}
                    onChange={(e) => setFormData({ ...formData, serviceCentre: e.target.value })}
                  >
                    <option value="">Select Centre Location...</option>
                    {centres.map((sc) => (
                      <option key={sc._id} value={sc._id}>{sc.name} - {sc.city}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Scheduled Intake Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    className="form-control"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
