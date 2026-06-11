import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, User, Lock, Save, KeyRound, LogOut, AlertTriangle, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import { useAuth } from '../AuthContext';
import { useTasks } from '../TasksContext';
import { api } from '../api';

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { tasks } = useTasks();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [toast, setToast] = useState(null);

  const initials = user?.name
    ? user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.name.trim() || !profile.email.trim()) {
      setToast({ message: 'Name and email cannot be empty.', type: 'error' });
      return;
    }
    setSavingProfile(true);
    try {
      const data = await api.updateProfile({ name: profile.name.trim(), email: profile.email.trim() });
      updateUser(data.user);
      setToast({ message: 'Profile updated successfully', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword) {
      setToast({ message: 'Fill in both password fields.', type: 'error' });
      return;
    }
    if (passwords.newPassword.length < 6) {
      setToast({ message: 'New password should be at least 6 characters.', type: 'error' });
      return;
    }
    if (passwords.newPassword !== passwords.confirm) {
      setToast({ message: 'New passwords do not match.', type: 'error' });
      return;
    }
    setSavingPassword(true);
    try {
      await api.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
      setToast({ message: 'Password changed successfully', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your account and all tasks permanently? This cannot be undone.')) return;
    try {
      await api.deleteAccount();
      logout();
      navigate('/signup');
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  return (
    <Layout tasks={tasks}>
      <Link to="/dashboard" className="back-link">
        <ArrowLeft size={15} /> Back to Dashboard
      </Link>

      <div className="topbar">
        <div className="topbar-left">
          <h1>
            <SettingsIcon size={24} />
            Account Settings
          </h1>
          <p>Manage your profile and security settings</p>
        </div>
      </div>

      <div className="settings-profile-header">
        <div className="user-avatar">{initials}</div>
        <div>
          <h2 style={{ fontSize: 18 }}>{user?.name}</h2>
          <p style={{ margin: '2px 0 0', color: 'var(--text-soft)', fontSize: 13 }}>{user?.email}</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>
              <User size={16} />
              Personal Information
            </h2>
          </div>
          <form onSubmit={handleProfileSave}>
            <div className="field">
              <label>Full Name</label>
              <input
                className="input"
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Email Address</label>
              <input
                className="input"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={savingProfile}>
              {savingProfile ? <span className="spinner" /> : (<><Save size={16} /> Save Changes</>)}
            </button>
          </form>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>
              <Lock size={16} />
              Security
            </h2>
          </div>
          <form onSubmit={handlePasswordChange}>
            <div className="field">
              <label>Current Password</label>
              <input
                className="input"
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                autoComplete="current-password"
              />
            </div>
            <div className="field">
              <label>New Password</label>
              <input
                className="input"
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                autoComplete="new-password"
              />
            </div>
            <div className="field">
              <label>Confirm New Password</label>
              <input
                className="input"
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                autoComplete="new-password"
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={savingPassword}>
              {savingPassword ? <span className="spinner" /> : (<><KeyRound size={16} /> Change Password</>)}
            </button>
          </form>

          <div className="danger-zone">
            <h4><AlertTriangle size={14} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />Danger Zone</h4>
            <p>Logging out ends your session. Deleting your account removes all your tasks permanently.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={handleLogout} type="button">
                <LogOut size={15} /> Logout
              </button>
              <button className="btn btn-danger" onClick={handleDeleteAccount} type="button">
                <Trash2 size={15} /> Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}
