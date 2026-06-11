import React from 'react';
import { Check, Pencil, Trash2, Calendar, Clock4, AlertTriangle } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function isOverdue(task) {
  if (!task.dueDate || task.completed) return false;
  return new Date(task.dueDate) < new Date(new Date().toDateString());
}

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const overdue = isOverdue(task);

  return (
    <div className={`task-card priority-${(task.priority || 'low').toLowerCase()}${task.completed ? ' completed' : ''}`}>
      <button
        className={`task-checkbox${task.completed ? ' checked' : ''}`}
        onClick={() => onToggle(task)}
        aria-label={task.completed ? 'Mark as in progress' : 'Mark as completed'}
      >
        {task.completed && <Check size={14} strokeWidth={3} />}
      </button>

      <div className="task-body">
        <div className="task-title-row">
          <span className="task-title">{task.title}</span>
          <span className={`badge ${(task.priority || 'low').toLowerCase()}`}>{task.priority}</span>
          <span className={`badge ${task.completed ? 'completed' : 'in-progress'}`}>
            {task.completed ? 'Completed' : 'In Progress'}
          </span>
        </div>

        {task.description && <p className="task-desc">{task.description}</p>}

        <div className="task-meta">
          <span>
            <Clock4 size={13} /> Created {formatDateTime(task.createdAt)}
          </span>
          {task.dueDate && (
            <span className={overdue ? 'overdue' : ''}>
              {overdue ? <AlertTriangle size={13} /> : <Calendar size={13} />}
              Due {formatDate(task.dueDate)}
              {overdue ? ' (overdue)' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="task-actions">
        <button className="icon-btn" onClick={() => onEdit(task)} aria-label="Edit task">
          <Pencil size={15} />
        </button>
        <button className="icon-btn danger" onClick={() => onDelete(task)} aria-label="Delete task">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
