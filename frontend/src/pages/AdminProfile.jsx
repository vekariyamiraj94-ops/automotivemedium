import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  KeyRound,
  Bell,
  Settings,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  X,
  LogOut,
  Camera,
  Check,
  Building2,
  Globe,
  Lock,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const PRESET_AVATARS = [
  '🏎️',
  '🚗',
  '🚘',
  '⚙️',
  '🔧',
  '🛡️',
  '👨‍💼',
  '👩‍💼',
  '🏁',
  '⚡',
];

export default function AdminProfile() {
  const { user, updateUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'edit' | 'password' | 'settings' | 'security'
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Full admin profile state from backend
  const [profile, setProfile] = useState({
    _id: '',
    name: '',
    username: '',
    email: '',
    phone: '',
    role: 'admin',
    avatar: '👨‍💼',
    createdAt: '',
    lastLogin: '',
    isActive: true,
    notifications: {
      emailNotifications: true,
      bookingNotifications: true,
      lowStockAlerts: true,
      serviceUpdates: true,
    },
    language: 'English',
    dateFormat: 'DD/MM/YYYY',
    serviceCentre: null,
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    avatar: '',
  });

  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    notifications: {
      emailNotifications: true,
      bookingNotifications: true,
      lowStockAlerts: true,
      serviceUpdates: true,
    },
    language: 'English',
    dateFormat: 'DD/MM/YYYY',
  });

  // Logout modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Auto-dismiss alerts after 5 seconds
  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => setAlert({ type: '', message: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Fetch admin profile from backend
  const fetchProfile = async () => {
    try {
      setFetching(true);
      const res = await api.get('/admin/profile');
      if (res.success && res.data) {
        const data = res.data;
        setProfile(data);
        setEditForm({
          name: data.name || '',
          username: data.username || '',
          email: data.email || '',
          phone: data.phone || '',
          avatar: data.avatar || '👨‍💼',
        });
        setSettingsForm({
          notifications: {
            emailNotifications: data.notifications?.emailNotifications ?? true,
            bookingNotifications: data.notifications?.bookingNotifications ?? true,
            lowStockAlerts: data.notifications?.lowStockAlerts ?? true,
            serviceUpdates: data.notifications?.serviceUpdates ?? true,
          },
          language: data.language || 'English',
          dateFormat: data.dateFormat || 'DD/MM/YYYY',
        });
        updateUser(data);
      }
    } catch (err) {
      // Fallback with current user context info if backend not reachable
      if (user) {
        setProfile((prev) => ({
          ...prev,
          name: user.name || 'Administrator',
          username: user.username || 'admin',
          email: user.email || 'admin@automotivemedium.com',
          role: user.role || 'admin',
          createdAt: user.createdAt || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        }));
        setEditForm({
          name: user.name || 'Administrator',
          username: user.username || 'admin',
          email: user.email || 'admin@automotivemedium.com',
          phone: user.phone || '+91 98765 43210',
          avatar: user.avatar || '👨‍💼',
        });
      }
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle Edit Profile submission
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      setAlert({ type: 'error', message: 'Full name is required.' });
      return;
    }
    if (!editForm.email.trim() || !editForm.email.includes('@')) {
      setAlert({ type: 'error', message: 'A valid email address is required.' });
      return;
    }

    try {
      setLoading(true);
      const res = await api.put('/admin/profile', editForm);
      if (res.success) {
        setAlert({ type: 'success', message: res.message || 'Profile updated successfully!' });
        setProfile(res.data);
        updateUser(res.data);
        setActiveTab('overview');
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  // Calculate Password Strength (0 to 100)
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'Too short', color: '#94a3b8' };
    let score = 0;
    if (pwd.length >= 8) score += 30;
    if (pwd.length >= 12) score += 15;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 20;
    if (/[0-9]/.test(pwd)) score += 20;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 15;

    if (score < 40) return { score, label: 'Weak', color: '#ef4444' };
    if (score < 75) return { score, label: 'Moderate', color: '#f59e0b' };
    return { score: 100, label: 'Strong & Secure', color: '#10b981' };
  };

  const passwordStrength = calculatePasswordStrength(passwordForm.newPassword);

  // Handle Change Password submission
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      setAlert({ type: 'error', message: 'Please enter your current password.' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setAlert({ type: 'error', message: 'New password must be at least 8 characters long.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setAlert({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    try {
      setLoading(true);
      const res = await api.put('/admin/change-password', passwordForm);
      if (res.success) {
        setAlert({
          type: 'success',
          message: res.message || 'Password changed successfully! Keep it secure.',
        });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Password update failed.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Settings submission
  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.put('/admin/settings', settingsForm);
      if (res.success) {
        setAlert({ type: 'success', message: 'Account preferences updated and saved!' });
        setProfile((prev) => ({
          ...prev,
          notifications: res.data.notifications,
          language: res.data.language,
          dateFormat: res.data.dateFormat,
        }));
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to save settings.' });
    } finally {
      setLoading(false);
    }
  };

  // Format Dates nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="admin-profile-page">
      {/* Top Banner Alert */}
      {alert.message && (
        <div
          className={`profile-alert ${alert.type === 'success' ? 'profile-alert-success' : 'profile-alert-error'}`}
        >
          {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{alert.message}</span>
          <button
            onClick={() => setAlert({ type: '', message: '' })}
            className="alert-close-btn"
            aria-label="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Hero Profile Overview Card */}
      <div className="profile-hero-card">
        <div className="profile-hero-content">
          <div className="profile-avatar-large">
            {profile.avatar && profile.avatar.length <= 4 ? (
              <span className="profile-avatar-emoji">{profile.avatar}</span>
            ) : profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="profile-avatar-img" />
            ) : (
              <span className="profile-avatar-initials">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'A'}
              </span>
            )}
            <button
              className="avatar-edit-badge"
              onClick={() => setActiveTab('edit')}
              title="Change Profile Photo"
            >
              <Camera size={14} />
            </button>
          </div>

          <div className="profile-hero-info">
            <div className="profile-name-row">
              <h2>{profile.name || 'System Administrator'}</h2>
              <span className="badge badge-blue">
                <Shield size={12} style={{ marginRight: '4px' }} />
                {profile.role?.toUpperCase() || 'ADMIN'}
              </span>
              <span className="badge badge-green">
                <Check size={12} style={{ marginRight: '4px' }} />
                Active Account
              </span>
            </div>
            <p className="profile-hero-handle">
              @{profile.username || 'admin'} • {profile.email}
            </p>
            <div className="profile-hero-meta">
              <span>
                <Phone size={13} /> {profile.phone || 'No phone set'}
              </span>
              <span>
                <Calendar size={13} /> Member since {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'Nov 2026'}
              </span>
              <span>
                <Clock size={13} /> Last login: {formatDate(profile.lastLogin)}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-hero-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('edit')}
          >
            Edit Profile
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setActiveTab('password')}
          >
            <KeyRound size={14} />
            Change Password
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="profile-tabs-nav">
        <button
          className={`profile-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <User size={16} />
          <span>My Profile</span>
        </button>
        <button
          className={`profile-tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
          onClick={() => setActiveTab('edit')}
        >
          <Settings size={16} />
          <span>Edit Profile</span>
        </button>
        <button
          className={`profile-tab-btn ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          <KeyRound size={16} />
          <span>Change Password</span>
        </button>
        <button
          className={`profile-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Bell size={16} />
          <span>Notifications & Settings</span>
        </button>
        <button
          className={`profile-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Shield size={16} />
          <span>Security & Session</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="profile-section-card">
          <div className="card-header">
            <div className="card-title">
              <h3>Profile Information & Workshop Authority</h3>
              <p>Verified executive details, assigned service centre and credentials</p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('edit')}
            >
              Edit Details
            </button>
          </div>

          <div className="profile-details-grid">
            <div className="detail-item">
              <label>Full Name</label>
              <div className="detail-value">{profile.name || 'Not provided'}</div>
            </div>
            <div className="detail-item">
              <label>Username</label>
              <div className="detail-value font-mono">@{profile.username || 'admin'}</div>
            </div>
            <div className="detail-item">
              <label>Email Address</label>
              <div className="detail-value font-mono">{profile.email}</div>
            </div>
            <div className="detail-item">
              <label>Phone Number</label>
              <div className="detail-value">{profile.phone || '+91 98765 43210'}</div>
            </div>
            <div className="detail-item">
              <label>Administrative Role</label>
              <div className="detail-value">
                <span className="badge badge-blue">Executive Workshop Administrator</span>
              </div>
            </div>
            <div className="detail-item">
              <label>Account Status</label>
              <div className="detail-value">
                <span className="badge badge-green">Active & Verified</span>
              </div>
            </div>
            <div className="detail-item">
              <label>Assigned Workshop</label>
              <div className="detail-value">
                {profile.serviceCentre?.name ? (
                  <span>{profile.serviceCentre.name} ({profile.serviceCentre.city})</span>
                ) : (
                  <span>All Regional Service Centres (Global Admin)</span>
                )}
              </div>
            </div>
            <div className="detail-item">
              <label>System Language</label>
              <div className="detail-value">{profile.language || 'English'}</div>
            </div>
            <div className="detail-item">
              <label>Date Format</label>
              <div className="detail-value font-mono">{profile.dateFormat || 'DD/MM/YYYY'}</div>
            </div>
            <div className="detail-item">
              <label>Account Created Date</label>
              <div className="detail-value">{formatDate(profile.createdAt)}</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EDIT PROFILE */}
      {activeTab === 'edit' && (
        <div className="profile-section-card">
          <div className="card-header">
            <div className="card-title">
              <h3>Edit Profile Details</h3>
              <p>Update your personal information, username, and avatar</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="profile-form">
            {/* Avatar Selector */}
            <div className="form-group">
              <label>Choose Profile Avatar / Icon</label>
              <div className="avatar-picker-grid">
                {PRESET_AVATARS.map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    className={`avatar-choice-btn ${editForm.avatar === emoji ? 'selected' : ''}`}
                    onClick={() => setEditForm({ ...editForm, avatar: emoji })}
                  >
                    <span>{emoji}</span>
                  </button>
                ))}
              </div>
              <div style={{ marginTop: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Or enter image URL (https://...)"
                  value={editForm.avatar}
                  onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>
                  Full Name <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>
                  Username <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. admin"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                />
                <small className="form-helper">Used to sign in alongside email.</small>
              </div>

              <div className="form-group">
                <label>
                  Email Address <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="email"
                  className="form-input"
                  required
                  placeholder="e.g. admin@automotivemedium.com"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +91 98765 43210"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-actions-bar">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveTab('overview')}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner-sm"></span> : <Save size={16} />}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: CHANGE PASSWORD */}
      {activeTab === 'password' && (
        <div className="profile-section-card">
          <div className="card-header">
            <div className="card-title">
              <h3>Change Password & Authentication</h3>
              <p>Secure your administrative account with bcrypt encrypted credentials</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="profile-form">
            <div className="form-group" style={{ maxWidth: '500px' }}>
              <label>Current Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword.current ? 'text' : 'password'}
                  className="form-input"
                  required
                  placeholder="Enter your current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() =>
                    setShowPassword({ ...showPassword, current: !showPassword.current })
                  }
                >
                  {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ maxWidth: '500px' }}>
              <label>New Password (Minimum 8 Characters)</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  className="form-input"
                  required
                  placeholder="Create a strong new password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() =>
                    setShowPassword({ ...showPassword, new: !showPassword.new })
                  }
                >
                  {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {passwordForm.newPassword && (
                <div className="password-strength-box">
                  <div className="strength-header">
                    <span>Password Strength:</span>
                    <strong style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </strong>
                  </div>
                  <div className="strength-bar-track">
                    <div
                      className="strength-bar-fill"
                      style={{
                        width: `${passwordStrength.score}%`,
                        backgroundColor: passwordStrength.color,
                      }}
                    ></div>
                  </div>
                  <ul className="strength-checklist">
                    <li className={passwordForm.newPassword.length >= 8 ? 'valid' : 'invalid'}>
                      {passwordForm.newPassword.length >= 8 ? '✓' : '•'} At least 8 characters
                    </li>
                    <li className={/[0-9]/.test(passwordForm.newPassword) ? 'valid' : 'invalid'}>
                      {/[0-9]/.test(passwordForm.newPassword) ? '✓' : '•'} Contains a number
                    </li>
                    <li className={/[^A-Za-z0-9]/.test(passwordForm.newPassword) ? 'valid' : 'invalid'}>
                      {/[^A-Za-z0-9]/.test(passwordForm.newPassword) ? '✓' : '•'} Contains a special symbol (!@#$%^&*)
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="form-group" style={{ maxWidth: '500px' }}>
              <label>Confirm New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  className="form-input"
                  required
                  placeholder="Re-type new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() =>
                    setShowPassword({ ...showPassword, confirm: !showPassword.confirm })
                  }
                >
                  {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordForm.confirmPassword &&
                passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <small style={{ color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                    Passwords do not match.
                  </small>
                )}
            </div>

            <div className="form-actions-bar">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setActiveTab('overview');
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner-sm"></span> : <KeyRound size={16} />}
                <span>Save New Password</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: SETTINGS & NOTIFICATIONS */}
      {activeTab === 'settings' && (
        <div className="profile-section-card">
          <div className="card-header">
            <div className="card-title">
              <h3>Notification & Regional Preferences</h3>
              <p>Configure automated system alerts and localization preferences</p>
            </div>
          </div>

          <form onSubmit={handleUpdateSettings} className="profile-form">
            <h4 className="settings-subheading">Workshop Alerts & Notifications</h4>
            <div className="settings-toggle-list">
              <div className="toggle-row">
                <div className="toggle-info">
                  <strong>Email Notifications</strong>
                  <p>Receive executive activity summaries and daily workshop KPI reports via email.</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settingsForm.notifications.emailNotifications}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        notifications: {
                          ...settingsForm.notifications,
                          emailNotifications: e.target.checked,
                        },
                      })
                    }
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-row">
                <div className="toggle-info">
                  <strong>Booking & Job Card Alerts</strong>
                  <p>Get real-time alerts whenever a customer books a new car service or inspection.</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settingsForm.notifications.bookingNotifications}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        notifications: {
                          ...settingsForm.notifications,
                          bookingNotifications: e.target.checked,
                        },
                      })
                    }
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-row">
                <div className="toggle-info">
                  <strong>Low Stock Inventory Alerts</strong>
                  <p>Trigger automatic alerts when critical spare parts drop below safety thresholds.</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settingsForm.notifications.lowStockAlerts}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        notifications: {
                          ...settingsForm.notifications,
                          lowStockAlerts: e.target.checked,
                        },
                      })
                    }
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-row">
                <div className="toggle-info">
                  <strong>Service Workflow Updates</strong>
                  <p>Receive notifications when job stages transition from Booked to Inspection or Completed.</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settingsForm.notifications.serviceUpdates}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        notifications: {
                          ...settingsForm.notifications,
                          serviceUpdates: e.target.checked,
                        },
                      })
                    }
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <h4 className="settings-subheading" style={{ marginTop: '28px' }}>
              Regional & Display Preferences
            </h4>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Language Preference</label>
                <select
                  className="form-input"
                  value={settingsForm.language}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, language: e.target.value })
                  }
                >
                  <option value="English">English (United Kingdom / India)</option>
                  <option value="Hindi">हिन्दी (Hindi)</option>
                  <option value="Gujarati">ગુજરાતી (Gujarati)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Date Format Preference</label>
                <select
                  className="form-input"
                  value={settingsForm.dateFormat}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, dateFormat: e.target.value })
                  }
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (Standard Indian - 25/11/2026)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (US Format - 11/25/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Format - 2026-11-25)</option>
                </select>
              </div>
            </div>

            <div className="form-actions-bar">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveTab('overview')}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner-sm"></span> : <Save size={16} />}
                <span>Save Preferences</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: SECURITY & SESSION */}
      {activeTab === 'security' && (
        <div className="profile-section-card">
          <div className="card-header">
            <div className="card-title">
              <h3>Security Status & Session Management</h3>
              <p>Active audit logs, authentication protocols and session termination</p>
            </div>
          </div>

          <div className="security-status-grid">
            <div className="security-card">
              <div className="security-card-icon green">
                <Shield size={24} />
              </div>
              <div className="security-card-content">
                <h4>Account Status</h4>
                <p>Status: <strong style={{ color: '#10b981' }}>Active & Verified</strong></p>
                <small>Full administrative privileges across workshop systems.</small>
              </div>
            </div>

            <div className="security-card">
              <div className="security-card-icon blue">
                <Lock size={24} />
              </div>
              <div className="security-card-content">
                <h4>Password Protection</h4>
                <p>Bcrypt 10-round salted hash</p>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '8px' }}
                  onClick={() => setActiveTab('password')}
                >
                  Change Password
                </button>
              </div>
            </div>

            <div className="security-card">
              <div className="security-card-icon amber">
                <Clock size={24} />
              </div>
              <div className="security-card-content">
                <h4>Last Login Activity</h4>
                <p>{formatDate(profile.lastLogin)}</p>
                <small>Authenticated via secure HTTP-Only Cookie + JWT.</small>
              </div>
            </div>
          </div>

          <div className="danger-zone-box">
            <div className="danger-zone-info">
              <h4>Sign Out Session</h4>
              <p>
                Safely end your current session and clear stored authentication credentials.
              </p>
            </div>
            <button
              className="btn btn-danger"
              onClick={() => setShowLogoutModal(true)}
            >
              <LogOut size={16} />
              <span>Sign Out Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <LogOut size={26} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              Confirm Admin Sign Out
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              Are you sure you want to log out of <strong>Automotivemedium</strong>? You will need to sign in again to access the dashboard.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
