import React, { useState, Suspense, lazy } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';

// Dynamic Lazy Loading & Code-Splitting for Optimal Bundle Size & Lighthouse Performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Bookings = lazy(() => import('./pages/Bookings'));
const Vehicles = lazy(() => import('./pages/Vehicles'));
const Customers = lazy(() => import('./pages/Customers'));
const Services = lazy(() => import('./pages/Services'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Brands = lazy(() => import('./pages/Brands'));
const ServiceCentres = lazy(() => import('./pages/ServiceCentres'));
const Reports = lazy(() => import('./pages/Reports'));
const ServiceHistory = lazy(() => import('./pages/ServiceHistory'));
const AdminProfile = lazy(() => import('./pages/AdminProfile'));

const pageTitles = {
  dashboard: {
    title: 'Executive Workshop Dashboard',
    subtitle: 'Live multi-brand performance KPIs, booking statuses and revenue trends',
  },
  profile: {
    title: 'Admin Profile & Account Settings',
    subtitle: 'Manage administrative identity, encrypted credentials, workshop preferences and security',
  },
  bookings: {
    title: 'Service Bookings & Job Cards',
    subtitle: 'Advance service workflow: Booked ➔ Inspection ➔ In Progress ➔ Completed',
  },
  vehicles: {
    title: 'Multi-Brand Vehicle Fleet',
    subtitle: 'Manage customer car models: Maruti, Hyundai, Tata, Mahindra, Toyota, Honda',
  },
  customers: {
    title: 'Customer Directory & CRM',
    subtitle: 'Manage vehicle owner accounts, contact details and communications',
  },
  services: {
    title: 'Service Packages Catalog',
    subtitle: 'Standardized repair packages, estimated durations and labour costs',
  },
  inventory: {
    title: 'Spare Parts & Consumables',
    subtitle: 'Real-time stock valuation, reorder thresholds and supply chain metrics',
  },
  brands: {
    title: 'Supported Car Brands',
    subtitle: 'OEM compatibility specifications and popular automotive models',
  },
  centres: {
    title: 'Service Centre Network',
    subtitle: 'Workshop bay capacity, active mechanics and facility operations',
  },
  reports: {
    title: 'MongoDB Aggregation Analytics Engine',
    subtitle: 'High-speed server-side aggregation pipelines (Model.aggregate())',
  },
  history: {
    title: 'Historical Job Records',
    subtitle: 'Audit trail of completed service jobs, parts billed and customer ratings',
  },
};

function MainApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Protect Admin Dashboard routes: if unauthenticated, show modern login page
  if (!user) {
    return <Login onLoginSuccess={() => setActiveTab('dashboard')} />;
  }

  const currentMeta = pageTitles[activeTab] || pageTitles.dashboard;

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        <Navbar title={currentMeta.title} subtitle={currentMeta.subtitle} setActiveTab={setActiveTab} />
        <div className="content-body">
          <Suspense
            fallback={
              <div
                className="empty-state"
                style={{
                  minHeight: '300px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div className="spinner"></div>
                <p>Loading module bundle...</p>
              </div>
            }
          >
            {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
            {activeTab === 'profile' && <AdminProfile />}
            {activeTab === 'bookings' && <Bookings />}
            {activeTab === 'customers' && <Customers />}
            {activeTab === 'services' && <Services />}
            {activeTab === 'inventory' && <Inventory />}
            {activeTab === 'centres' && <ServiceCentres />}
            {activeTab === 'reports' && <Reports />}
            {activeTab === 'history' && <ServiceHistory />}
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
