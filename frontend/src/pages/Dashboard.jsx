import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  CalendarCheck,
  Wrench,
  Users,
  Car,
  Package,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import StatCard from '../components/StatCard';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function Dashboard({ setActiveTab }) {
  const [kpis, setKpis] = useState({
    totalBookings: 8,
    totalRevenue: 50039,
    activeServices: 3,
    completedServices: 4,
    totalCustomers: 7,
    totalVehicles: 7,
  });

  const [brandData, setBrandData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [kpiRes, brandRes, monthRes, bookingRes] = await Promise.allSettled([
          api.get('/reports/dashboard-kpis'),
          api.get('/reports/bookings-by-brand'),
          api.get('/reports/monthly-revenue'),
          api.get('/bookings?limit=5'),
        ]);

        if (kpiRes.status === 'fulfilled' && kpiRes.value?.data) {
          setKpis(kpiRes.value.data);
        }
        if (brandRes.status === 'fulfilled' && brandRes.value?.data) {
          setBrandData(brandRes.value.data);
        }
        if (monthRes.status === 'fulfilled' && monthRes.value?.data) {
          setMonthlyData(monthRes.value.data);
        }
        if (bookingRes.status === 'fulfilled' && bookingRes.value?.data) {
          setRecentBookings(bookingRes.value.data);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format currency helper
  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'badge-green';
      case 'In Progress':
        return 'badge-blue';
      case 'Parts Replacement':
        return 'badge-amber';
      case 'Inspection':
        return 'badge-purple';
      case 'Booked':
        return 'badge-cyan';
      default:
        return 'badge-red';
    }
  };

  // Monthly Revenue Chart Data
  const monthlyChartData = {
    labels:
      monthlyData.length > 0
        ? monthlyData.map((m) => m.monthLabel || m.monthYear)
        : ['Sep 2026', 'Oct 2026', 'Nov 2026'],
    datasets: [
      {
        label: 'Labour Revenue',
        data:
          monthlyData.length > 0
            ? monthlyData.map((m) => m.labourRevenue || 0)
            : [7696, 5097, 8898],
        backgroundColor: '#3b82f6',
        borderRadius: 6,
      },
      {
        label: 'Spare Parts Revenue',
        data:
          monthlyData.length > 0
            ? monthlyData.map((m) => m.partsRevenue || 0)
            : [4400, 4700, 9900],
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
    ],
  };

  // Brand Distribution Doughnut Chart Data
  const brandChartData = {
    labels:
      brandData.length > 0
        ? brandData.map((b) => b.brandName)
        : ['Maruti Suzuki', 'Hyundai', 'Tata Motors', 'Toyota', 'Mahindra', 'Honda'],
    datasets: [
      {
        data:
          brandData.length > 0
            ? brandData.map((b) => b.totalBookings)
            : [3, 2, 2, 1, 1, 1],
        backgroundColor: [
          '#2563eb',
          '#10b981',
          '#f59e0b',
          '#8b5cf6',
          '#ec4899',
          '#06b6d4',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  return (
    <div>
      {/* KPI Stats Grid */}
      <div className="metrics-grid">
        <StatCard
          title="Total Workshop Revenue"
          value={formatINR(kpis.totalRevenue)}
          subtitle="All service centres combined"
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Active Workflows"
          value={kpis.activeServices || 3}
          subtitle="In Progress & Inspection"
          icon={Wrench}
          color="amber"
        />
        <StatCard
          title="Total Bookings"
          value={kpis.totalBookings || 8}
          subtitle={`${kpis.completedServices || 4} successfully completed`}
          icon={CalendarCheck}
          color="blue"
        />
        <StatCard
          title="Customers & Fleet"
          value={`${kpis.totalCustomers || 7} / ${kpis.totalVehicles || 7}`}
          subtitle="Verified car owners"
          icon={Users}
          color="purple"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Monthly Revenue Breakdown</h3>
              <p>Aggregation by month: Labour vs Genuine Spare Parts</p>
            </div>
            <span className="badge badge-blue">Model.aggregate()</span>
          </div>
          <div style={{ height: '280px' }}>
            <Bar
              data={monthlyChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                },
                scales: {
                  x: { grid: { display: false } },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `₹${value.toLocaleString('en-IN')}`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Service Share by Brand</h3>
              <p>Multi-brand car distribution in service bays</p>
            </div>
            <span className="badge badge-purple">MongoDB $group</span>
          </div>
          <div style={{ height: '280px', display: 'flex', justifyContent: 'center' }}>
            <Doughnut
              data={brandChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right' },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Live Service Bookings Queue */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <h3>Live Service Workshop Queue</h3>
            <p>Real-time tracking of multi-brand vehicles across all workshop bays</p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setActiveTab('bookings')}
          >
            <span>View All Bookings</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Booking #</th>
                <th>Car & Model</th>
                <th>Reg. Number</th>
                <th>Customer</th>
                <th>Service Centre</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length > 0 ? (
                recentBookings.map((bk) => (
                  <tr key={bk._id}>
                    <td>
                      <strong>{bk.bookingNumber}</strong>
                    </td>
                    <td>
                      {bk.vehicle?.brand?.name || 'Car'} {bk.vehicle?.model || ''}
                    </td>
                    <td>
                      <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                        {bk.vehicle?.regNumber || 'MH-01-XXXX'}
                      </code>
                    </td>
                    <td>{bk.customer?.name || 'Walk-in Customer'}</td>
                    <td>{bk.serviceCentre?.name || 'Central Hub'}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(bk.status)}`}>
                        {bk.status}
                      </span>
                    </td>
                    <td>
                      <strong>{formatINR(bk.totalAmount)}</strong>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state">
                    Loading live booking data...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
