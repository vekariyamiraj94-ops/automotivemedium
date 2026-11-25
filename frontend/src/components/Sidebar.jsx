import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Car,
  Users,
  Package,
  Wrench,
  Building2,
  Tag,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  History,
  ShieldCheck,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, section: 'Core' },
  { id: 'bookings', label: 'Service Bookings', icon: CalendarCheck, section: 'Operations' },
  { id: 'vehicles', label: 'Vehicles', icon: Car, section: 'Operations' },
  { id: 'customers', label: 'Customers', icon: Users, section: 'Operations' },
  { id: 'services', label: 'Service Packages', icon: Wrench, section: 'Catalog' },
  { id: 'inventory', label: 'Spare Parts Inventory', icon: Package, section: 'Catalog' },
  { id: 'brands', label: 'Car Brands', icon: Tag, section: 'Catalog' },
  { id: 'centres', label: 'Service Centres', icon: Building2, section: 'Facilities' },
  { id: 'reports', label: 'MongoDB Aggregations', icon: BarChart3, section: 'Analytics' },
  { id: 'history', label: 'Service History', icon: History, section: 'Analytics' },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  let lastSection = null;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand-icon">
          🚗
        </div>
        <div className="sidebar-brand-text">
          <h1>Automotivemedium</h1>
          <span>Multi-Brand Workshop</span>
        </div>
      </div>

      <nav style={{ padding: '12px 0 30px' }}>
        {navItems.map((item) => {
          const showSection = item.section !== lastSection;
          lastSection = item.section;

          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          return (
            <React.Fragment key={item.id}>
              {showSection && (
                <div className="nav-section-title">{item.section}</div>
              )}
              <div
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                role="button"
                tabIndex={0}
              >
                <IconComponent />
                <span>{item.label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </nav>
    </aside>
  );
}
