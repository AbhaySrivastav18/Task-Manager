import React, { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Plus,
  ListChecks,
  TrendingUp,
  Clock,
  Flame,
  CheckCircle2,
  ListTodo,
  Activity,
  Filter,
} from 'lucide-react';
import Layout from '../components/Layout';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import Toast from '../components/Toast';
import { useTasks } from '../TasksContext';

const FILTERS = ['All', 'Today', 'Week', 'High', 'Medium', 'Low'];

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isThisWeek(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return d >= start && d < end;
}

export default function Dashboard() {
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks();
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toast, setToast] = useState(null);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const low = tasks.filter((t) => t.priority === 'Low').length;
    const medium = tasks.filter((t) => t.priority === 'Medium').length;
    const high = tasks.filter((t) => t.priority === 'High').length;
    const pending = total - completed;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, low, medium, high, pending, pct };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let list = tasks.filter((t) => !t.completed);
    switch (filter) {
      case 'Today':
        list = list.filter((t) => isToday(t.dueDate));
        break;
      case 'Week':
        list = list.filter((t) => isThisWeek(t.dueDate));
        break;
      case 'High':
      case 'Medium':
      case 'Low':
        list = list.filter((t) => t.priority === filter);
        break;
      default:
        break;
    }
    return list;
  }, [tasks, filter]);

  const recentActivity = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5);
  }, [tasks]);

  const handleCreate = async (formData) => {
    try {
      await createTask({
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate || null,
      });
      setShowModal(false);
      setToast({ message: 'Task created successfully', type: 'success' });
    } catch (e) {
      setToast({ message: e.message, type: 'error' });
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      await updateTask(editingTask.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate || null,
      });
      setEditingTask(null);
      setToast({ message: 'Task updated', type: 'success' });
    } catch (e) {
      setToast({ message: e.message, type: 'error' });
    }
  };

  const handleToggle = async (task) => {
    try {
      await updateTask(task.id, { completed: !task.completed, status: task.completed ? 'In Progress' : 'Completed' });
      setToast({ message: task.completed ? 'Marked as in progress' : 'Task completed 🎉', type: 'success' });
    } catch (e) {
      setToast({ message: e.message, type: 'error' });
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete "${task.title}"? This can't be undone.`)) return;
    try {
      await deleteTask(task.id);
      setToast({ message: 'Task deleted', type: 'success' });
    } catch (e) {
      setToast({ message: e.message, type: 'error' });
    }
  };

  return (
    <Layout tasks={tasks}>
      <div className="topbar">
        <div className="topbar-left">
          <h1>
            <LayoutDashboard size={24} />
            Task Overview
          </h1>
          <p>Manage your tasks efficiently</p>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add New Task
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon violet">
            <ListChecks size={18} />
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <Clock size={18} />
          </div>
          <div className="stat-value">{stats.low}</div>
          <div className="stat-label">Low Priority</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">
            <Flame size={18} />
          </div>
          <div className="stat-value">{stats.medium}</div>
          <div className="stat-label">Medium Priority</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">
            <Flame size={18} />
          </div>
          <div className="stat-value">{stats.high}</div>
          <div className="stat-label">High Priority</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>
              <Filter size={16} />
              Pending Tasks
            </h2>
            <div className="filter-row">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  className={`chip${filter === f ? ' active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="spinner dark" style={{ margin: '0 auto' }} />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <ListTodo size={28} />
              </div>
              <h3>Nothing here yet</h3>
              <p>Add a task or try a different filter to see what's coming up.</p>
            </div>
          ) : (
            <div className="task-list">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onEdit={setEditingTask}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          <button
            className="btn btn-secondary btn-block"
            style={{ marginTop: 16 }}
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} /> Add New Task
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="panel">
            <div className="panel-header">
              <h2>
                <TrendingUp size={16} />
                Task Statistics
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="stat-card" style={{ padding: 14 }}>
                <div className="stat-icon violet" style={{ width: 32, height: 32 }}>
                  <ListChecks size={15} />
                </div>
                <div className="stat-value" style={{ fontSize: 20 }}>{stats.total}</div>
                <div className="stat-label">Total Tasks</div>
              </div>
              <div className="stat-card" style={{ padding: 14 }}>
                <div className="stat-icon green" style={{ width: 32, height: 32 }}>
                  <CheckCircle2 size={15} />
                </div>
                <div className="stat-value" style={{ fontSize: 20 }}>{stats.completed}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-card" style={{ padding: 14 }}>
                <div className="stat-icon amber" style={{ width: 32, height: 32 }}>
                  <ListTodo size={15} />
                </div>
                <div className="stat-value" style={{ fontSize: 20 }}>{stats.pending}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-card" style={{ padding: 14 }}>
                <div className="stat-icon blue" style={{ width: 32, height: 32 }}>
                  <TrendingUp size={15} />
                </div>
                <div className="stat-value" style={{ fontSize: 20 }}>{stats.pct}%</div>
                <div className="stat-label">Completion Rate</div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <div className="productivity-label">
                <span>Task Progress</span>
                <span className="pct">{stats.completed}/{stats.total}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${stats.pct}%` }} />
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>
                <Activity size={16} />
                Recent Activity
              </h2>
            </div>
            {recentActivity.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 12px' }}>
                <p>No activity yet — create your first task to get going.</p>
              </div>
            ) : (
              recentActivity.map((task) => (
                <div className="activity-item" key={task.id}>
                  <div className="activity-icon">
                    {task.completed ? <CheckCircle2 size={16} /> : <ListTodo size={16} />}
                  </div>
                  <div className="activity-text">
                    <div className="a-title">{task.title}</div>
                    <div className="a-sub">
                      {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <span className={`badge ${task.completed ? 'completed' : 'in-progress'}`}>
                    {task.completed ? 'Done' : 'Active'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && <TaskModal onClose={() => setShowModal(false)} onSubmit={handleCreate} />}
      {editingTask && (
        <TaskModal initialTask={editingTask} onClose={() => setEditingTask(null)} onSubmit={handleEditSubmit} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}
