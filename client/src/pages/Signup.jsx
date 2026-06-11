import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Fill in your name, email, and password to continue.');
      return;
    }
    if (form.password.length < 6) {
      setError('Your password should be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await signup(form.name.trim(), form.email.trim(), form.password);
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
          <div className="auth-headline">Organize your work. Finish what matters.</div>
          <div className="auth-subline">
            Create an account to start tracking tasks with priorities, due dates, and a clear view of your progress.
          </div>
        </div>
        <div className="auth-stats">
          <div>
            <div className="auth-stat-num">1 min</div>
            <div className="auth-stat-label">To get started</div>
          </div>
          <div>
            <div className="auth-stat-num">Free</div>
            <div className="auth-stat-label">No card needed</div>
          </div>
          <div>
            <div className="auth-stat-num">Private</div>
            <div className="auth-stat-label">Your tasks, your account</div>
          </div>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-card">
          <h1>Create your account</h1>
          <p className="auth-sub">Set up Task Manager in a few seconds.</p>

          {error && (
            <div className="auth-banner">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label>Full name</label>
              <div className="input-wrap">
                <User size={16} />
                <input
                  className="input"
                  type="text"
                  name="name"
                  placeholder="Hexagon"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
            </div>
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
            <div className="field-row">
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
                    autoComplete="new-password"
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
              <div className="field">
                <label>Confirm</label>
                <div className="input-wrap">
                  <Lock size={16} />
                  <input
                    className="input"
                    type={showPassword ? 'text' : 'password'}
                    name="confirm"
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create account'}
            </button>
          </form>

          <div className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
