import React, { useState, useEffect } from 'react';
import { History, CheckCircle, Calendar, Star, FileText } from 'lucide-react';
import api from '../services/api';

export default function ServiceHistory() {
  const [completedBookings, setCompletedBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/bookings?status=Completed')
      .then((res) => {
        if (res.data) setCompletedBookings(res.data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <h3>Completed Service History & Digital Job Cards</h3>
          <p>Audited vehicle service records, customer feedback ratings and parts replacement logs</p>
        </div>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Job Card #</th>
              <th>Vehicle & Model</th>
              <th>Customer</th>
              <th>Service Date</th>
              <th>Parts Replaced</th>
              <th>Rating</th>
              <th>Total Billed</th>
            </tr>
          </thead>
          <tbody>
            {completedBookings.length > 0 ? (
              completedBookings.map((b) => (
                <tr key={b._id}>
                  <td><strong>{b.bookingNumber}</strong></td>
                  <td>
                    <div><strong>{b.vehicle?.brand?.name} {b.vehicle?.model}</strong></div>
                    <code style={{ fontSize: '11px' }}>{b.vehicle?.regNumber}</code>
                  </td>
                  <td>{b.customer?.name}</td>
                  <td>
                    {new Date(b.completedAt || b.scheduledDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td>
                    {(b.partsUsed || []).length > 0 ? (
                      b.partsUsed.map((p, i) => (
                        <div key={i} style={{ fontSize: '12px' }}>
                          • {p.name} (x{p.quantity})
                        </div>
                      ))
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Labour only</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>
                      <Star size={14} fill="#f59e0b" />
                      <strong>{b.customerFeedbackRating || 5}/5</strong>
                    </div>
                  </td>
                  <td><strong>₹{(b.totalAmount || 0).toLocaleString('en-IN')}</strong></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-state">
                  {loading ? 'Loading service history...' : 'No completed jobs recorded yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
