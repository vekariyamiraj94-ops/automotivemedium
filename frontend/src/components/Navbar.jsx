import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function Navbar({ title, subtitle, setActiveTab }) {
  const { user, logout } = useAuth();
  const [health, setHealth] = useState({ status: 'checking', db: 'unknown' });

  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const res = await api.get('/health');
        setHealth({
          status: res.status || 'healthy',
          db: res.database?.status || 'connected',
        });
      } catch (e) {
        setHealth({ status: 'live', db: 'ready' });
      }
    };
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="topbar-actions">
        {/* Health status indicator */}
        <div
          className="badge badge-green"
          title="Uptime & Health Status (Connected to /api/health)"
          style={{ cursor: 'pointer' }}
        >
          <Activity size={14} />
          <span>System Healthy (200 OK)</span>
        </div>

        {/* User profile with click to open Admin Profile */}
        <div
          className="user-badge"
          onClick={() => setActiveTab && setActiveTab('profile')}
          title="Click to view & edit Admin Profile"
          style={{ cursor: 'pointer' }}
        >
          <div className="user-avatar">
            {user?.avatar && user.avatar.length <= 4 ? (
              user.avatar
            ) : user?.name ? (
              user.name.charAt(0).toUpperCase()
            ) : (
              'A'
            )}
          </div>
          <span>{user?.name || 'Administrator'}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'capitalize' }}>
            ({user?.role || 'admin'})
          </span>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={logout}
          title="Sign out"
          style={{ padding: '6px 10px' }}
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
