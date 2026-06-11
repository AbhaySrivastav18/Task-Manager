import React, { useState } from 'react';
import { Plus, X, Clock } from 'lucide-react';

const today = () => new Date().toISOString().split('T')[0];

export default function TaskModal({ onClose, onSubmit, initialTask = null }) {
  const isEdit = !!initialTask;
  const [form, setForm] = useState({
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    priority: initialTask?.priority || 'Low',
    status: initialTask?.status || 'In Progress',
    dueDate: initialTask?.dueDate ? initialTask.dueDate.split('T')[0] : '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Give your task a title.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  };

  const createdLabel = isEdit
    ? new Date(initialTask.createdAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <span className="icon-circle">
              <Plus size={18} />
            </span>
            {isEdit ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="timestamp-note">
              <Clock size={14} />
              {isEdit ? 'Created' : 'Will be created'} on {createdLabel}
            </div>

            <div className={`field${error ? ' field-error' : ''}`}>
              <label>Task Title</label>
              <input
                className="input"
                type="text"
                name="title"
                placeholder="e.g. Finish landing page copy"
                value={form.title}
                onChange={handleChange}
                autoFocus
              />
              {error && <span className="error-text">{error}</span>}
            </div>

            <div className="field">
              <label>Description</label>
              <textarea
                className="input"
                name="description"
                placeholder="Add details about your task"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label>Priority</label>
                <select className="input" name="priority" value={form.priority} onChange={handleChange}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="field">
                <label>Due Date</label>
                <input
                  className="input"
                  type="date"
                  name="dueDate"
                  min={today()}
                  value={form.dueDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field">
              <label>Status</label>
              <select className="input" name="status" value={form.status} onChange={handleChange}>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
