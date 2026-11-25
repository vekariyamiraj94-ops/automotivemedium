import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Tag,
  Wrench,
  Package,
  Building2,
  PieChart,
  CheckCircle,
  Database,
  Code2,
} from 'lucide-react';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import api from '../services/api';

export default function Reports() {
  const [activeReport, setActiveReport] = useState('brand');
  const [loading, setLoading] = useState(false);

  // States for each aggregation report
  const [brandReport, setBrandReport] = useState([]);
  const [revenueReport, setRevenueReport] = useState([]);
  const [modelReport, setModelReport] = useState([]);
  const [inventoryReport, setInventoryReport] = useState({ summary: {}, byCategory: [], lowStockAlerts: [] });
  const [centreReport, setCentreReport] = useState([]);
  const [statusReport, setStatusReport] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const [bRes, rRes, mRes, iRes, cRes, sRes] = await Promise.allSettled([
          api.get('/reports/bookings-by-brand'),
          api.get('/reports/monthly-revenue'),
          api.get('/reports/most-serviced-models'),
          api.get('/reports/inventory-valuation'),
          api.get('/reports/service-centres'),
          api.get('/reports/status-distribution'),
        ]);

        if (bRes.status === 'fulfilled') setBrandReport(bRes.value.data || []);
        if (rRes.status === 'fulfilled') setRevenueReport(rRes.value.data || []);
        if (mRes.status === 'fulfilled') setModelReport(mRes.value.data || []);
        if (iRes.status === 'fulfilled') setInventoryReport(iRes.value.data || { summary: {}, byCategory: [] });
        if (cRes.status === 'fulfilled') setCentreReport(cRes.value.data || []);
        if (sRes.status === 'fulfilled') setStatusReport(sRes.value.data || []);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const reportsNav = [
    { id: 'brand', label: '1. Bookings by Brand', icon: Tag, stages: '$lookup ➔ $unwind ➔ $group ➔ $project ➔ $sort' },
    { id: 'revenue', label: '2. Monthly Revenue', icon: TrendingUp, stages: '$match ➔ $group ➔ $project ➔ $sort' },
    { id: 'models', label: '3. Most Serviced Models', icon: Wrench, stages: '$lookup ➔ $unwind ➔ $group ➔ $sort ➔ $limit' },
    { id: 'inventory', label: '4. Parts Valuation', icon: Package, stages: '$facet ➔ $group ➔ $project ➔ $match' },
    { id: 'centres', label: '5. Service Centres', icon: Building2, stages: '$lookup ➔ $group ➔ $project ➔ $sort' },
    { id: 'status', label: '6. Status Distribution', icon: PieChart, stages: '$group ➔ $project ➔ $sort' },
  ];

  return (
    <div>
      {/* Top Banner highlighting MongoDB Aggregation Architecture */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          color: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Database color="#38bdf8" size={20} />
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
              Native MongoDB Aggregation Engine (`Model.aggregate()`)
            </h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '13px', maxWidth: '720px' }}>
            Zero in-memory array filtering. Every metric, calculation, and multi-collection join is executed directly inside the MongoDB Atlas cluster using multi-stage pipelines for maximum throughput and sub-millisecond query execution.
          </p>
        </div>
        <span
          className="badge"
          style={{ background: '#0284c7', color: 'white', padding: '8px 14px', fontSize: '13px' }}
        >
          100% Database-Side Aggregations
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '4px' }}>
        {reportsNav.map((r) => (
          <button
            key={r.id}
            className={`btn ${activeReport === r.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveReport(r.id)}
            style={{ whiteSpace: 'nowrap' }}
          >
            <r.icon size={15} />
            <span>{r.label}</span>
          </button>
        ))}
      </div>

      {/* Report 1: Bookings By Brand */}
      {activeReport === 'brand' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Total Service Bookings by Car Brand</h3>
              <p>Pipeline Stages: <code>$lookup (vehicles) ➔ $lookup (brands) ➔ $group (brand) ➔ $sort (totalBookings: -1)</code></p>
            </div>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Origin</th>
                  <th>Total Intakes</th>
                  <th>Completed</th>
                  <th>In Progress</th>
                  <th>Total Revenue</th>
                  <th>Avg. Ticket Value</th>
                </tr>
              </thead>
              <tbody>
                {brandReport.length > 0 ? (
                  brandReport.map((b) => (
                    <tr key={b._id}>
                      <td><strong>{b.brandName}</strong></td>
                      <td>{b.country}</td>
                      <td><span className="badge badge-blue">{b.totalBookings} bookings</span></td>
                      <td><span className="badge badge-green">{b.completedBookings} done</span></td>
                      <td><span className="badge badge-amber">{b.inProgressBookings} live</span></td>
                      <td><strong>₹{(b.totalRevenue || 0).toLocaleString('en-IN')}</strong></td>
                      <td>₹{(b.averageTicketSize || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-state">No aggregation records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 2: Monthly Revenue */}
      {activeReport === 'revenue' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Monthly Workshop Revenue Stream</h3>
              <p>Pipeline Stages: <code>$match (non-cancelled) ➔ $group (year-month) ➔ $project (rounded figures) ➔ $sort</code></p>
            </div>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total Bookings</th>
                  <th>Labour Revenue</th>
                  <th>Parts Revenue</th>
                  <th>Gross Revenue</th>
                  <th>Avg Revenue / Car</th>
                </tr>
              </thead>
              <tbody>
                {revenueReport.length > 0 ? (
                  revenueReport.map((m) => (
                    <tr key={m._id}>
                      <td><strong>{m.monthLabel || m.monthYear}</strong></td>
                      <td>{m.totalBookings} services</td>
                      <td>₹{(m.labourRevenue || 0).toLocaleString('en-IN')}</td>
                      <td>₹{(m.partsRevenue || 0).toLocaleString('en-IN')}</td>
                      <td><strong style={{ color: 'var(--success)' }}>₹{(m.totalRevenue || 0).toLocaleString('en-IN')}</strong></td>
                      <td>₹{(m.avgRevenuePerBooking || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state">No monthly data aggregated.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 3: Most Serviced Models */}
      {activeReport === 'models' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Top 10 Most Serviced Car Models</h3>
              <p>Pipeline Stages: <code>$lookup ➔ $unwind ➔ $group (model & brand) ➔ $sort (serviceCount: -1) ➔ $limit (10)</code></p>
            </div>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Brand</th>
                  <th>Model Name</th>
                  <th>Service Frequency</th>
                  <th>Total Revenue Generated</th>
                  <th>Avg Vehicle Mileage</th>
                </tr>
              </thead>
              <tbody>
                {modelReport.length > 0 ? (
                  modelReport.map((m, idx) => (
                    <tr key={idx}>
                      <td><strong>#{idx + 1}</strong></td>
                      <td><span className="badge badge-purple">{m.brand}</span></td>
                      <td><strong>{m.model}</strong></td>
                      <td><span className="badge badge-blue">{m.serviceCount} visits</span></td>
                      <td><strong>₹{(m.totalRevenueGenerated || 0).toLocaleString('en-IN')}</strong></td>
                      <td>{(m.avgMileage || 0).toLocaleString('en-IN')} km</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state">No model data aggregated.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 4: Spare Parts Valuation */}
      {activeReport === 'inventory' && (
        <div>
          <div className="metrics-grid">
            <div className="stat-card">
              <div>
                <div className="stat-title">Catalog Parts</div>
                <div className="stat-value">{inventoryReport.summary?.totalPartsInCatalog || 0}</div>
                <div className="stat-subtitle">{inventoryReport.summary?.totalStockQuantity || 0} items in stock</div>
              </div>
            </div>
            <div className="stat-card">
              <div>
                <div className="stat-title">Inventory Valuation (Cost)</div>
                <div className="stat-value">₹{(inventoryReport.summary?.totalInventoryCostValue || 0).toLocaleString('en-IN')}</div>
                <div className="stat-subtitle">Purchase value</div>
              </div>
            </div>
            <div className="stat-card">
              <div>
                <div className="stat-title">Retail Valuation</div>
                <div className="stat-value" style={{ color: 'var(--success)' }}>
                  ₹{(inventoryReport.summary?.totalInventoryRetailValue || 0).toLocaleString('en-IN')}
                </div>
                <div className="stat-subtitle">Estimated sales value</div>
              </div>
            </div>
            <div className="stat-card">
              <div>
                <div className="stat-title">Low Stock Reorders</div>
                <div className="stat-value" style={{ color: 'var(--danger)' }}>
                  {inventoryReport.summary?.lowStockItemsCount || 0}
                </div>
                <div className="stat-subtitle">Below threshold</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Category-Wise Inventory Breakdown</h3>
              <p>Pipeline Stage: <code>$facet (multi-faceted parallel aggregation pipeline)</code></p>
            </div>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Part Types</th>
                    <th>Stock Quantity</th>
                    <th>Cost Value</th>
                    <th>Retail Value</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryReport.byCategory?.length > 0 ? (
                    inventoryReport.byCategory.map((c) => (
                      <tr key={c.category}>
                        <td><strong>{c.category}</strong></td>
                        <td>{c.partsCount} SKUs</td>
                        <td>{c.totalStock} units</td>
                        <td>₹{(c.categoryCostValue || 0).toLocaleString('en-IN')}</td>
                        <td><strong>₹{(c.categoryRetailValue || 0).toLocaleString('en-IN')}</strong></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="empty-state">No category breakdown found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Report 5: Service Centres */}
      {activeReport === 'centres' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Service Centre Performance & Bay Utilization</h3>
              <p>Pipeline Stages: <code>$lookup ➔ $unwind ➔ $group (centre) ➔ $project (utilization %) ➔ $sort</code></p>
            </div>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Center Name</th>
                  <th>City</th>
                  <th>Capacity Bays</th>
                  <th>Mechanics</th>
                  <th>Total Intakes</th>
                  <th>Active Work</th>
                  <th>Utilization Rate</th>
                  <th>Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {centreReport.length > 0 ? (
                  centreReport.map((c) => (
                    <tr key={c._id}>
                      <td><strong>{c.centreName}</strong></td>
                      <td><span className="badge badge-blue">{c.city}</span></td>
                      <td>{c.capacityBays} bays</td>
                      <td>{c.activeMechanics} mechanics</td>
                      <td><strong>{c.totalBookings}</strong></td>
                      <td><span className="badge badge-amber">{c.activeWorkflows} active</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '80px', height: '6px', background: '#e2e8f0', borderRadius: '3px' }}>
                            <div style={{ width: `${Math.min(c.utilizationRate || 0, 100)}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }}></div>
                          </div>
                          <span>{c.utilizationRate || 0}%</span>
                        </div>
                      </td>
                      <td><strong>₹{(c.totalRevenue || 0).toLocaleString('en-IN')}</strong></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="empty-state">No centre statistics available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 6: Status Distribution */}
      {activeReport === 'status' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Service Workflow Status Breakdown</h3>
              <p>Pipeline Stages: <code>$group (status) ➔ $project ➔ $sort (count: -1)</code></p>
            </div>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Workflow Status</th>
                  <th>Vehicle Count</th>
                  <th>Total Value In Queue</th>
                </tr>
              </thead>
              <tbody>
                {statusReport.length > 0 ? (
                  statusReport.map((s) => (
                    <tr key={s.status}>
                      <td>
                        <span className="badge badge-purple">{s.status}</span>
                      </td>
                      <td><strong>{s.count} vehicles</strong></td>
                      <td><strong>₹{(s.totalAmount || 0).toLocaleString('en-IN')}</strong></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="empty-state">No status distribution available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
