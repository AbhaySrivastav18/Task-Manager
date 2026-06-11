import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Enter your email and password to sign in.');
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <Zap size={20} fill="currentColor" />
            </div>
            Task Manager
          </div>
          <div className="auth-headline">Welcome back. Your day is waiting.</div>
          <div className="auth-subline">
            Pick up right where you left off — track priorities, due dates, and progress in one calm view.
          </div>
        </div>
        <div className="auth-stats">
          <div>
            <div className="auth-stat-num">100%</div>
            <div className="auth-stat-label">Completion rate</div>
          </div>
          <div>
            <div className="auth-stat-num">0</div>
            <div className="auth-stat-label">Tasks pending</div>
          </div>
          <div>
            <div className="auth-stat-num">24/7</div>
            <div className="auth-stat-label">Always synced</div>
          </div>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-card">
          <h1>Sign in</h1>
          <p className="auth-sub">Enter your details to access your tasks.</p>

          {error && (
            <div className="auth-banner">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label>Email</label>
              <div className="input-wrap">
                <Mail size={16} />
                <input
                  className="input"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="field">
              <label>Password</label>
              <div className="input-wrap">
                <Lock size={16} />
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign in'}
            </button>
          </form>

          <div className="auth-switch">
            New to Task Manager? <Link to="/signup">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
