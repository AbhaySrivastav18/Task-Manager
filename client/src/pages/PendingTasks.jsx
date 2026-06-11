import React, { useMemo, useState } from 'react';
import { ListTodo, Plus, Search } from 'lucide-react';
import Layout from '../components/Layout';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import Toast from '../components/Toast';
import { useTasks } from '../TasksContext';

export default function PendingTasks() {
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toast, setToast] = useState(null);

  const pending = useMemo(() => {
    return tasks
      .filter((t) => !t.completed)
      .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
  }, [tasks, search]);

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
      await updateTask(task.id, { completed: true, status: 'Completed' });
      setToast({ message: 'Task completed 🎉', type: 'success' });
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
            <ListTodo size={24} />
            Pending Tasks
          </h1>
          <p>{pending.length} task{pending.length !== 1 ? 's' : ''} still in progress</p>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add New Task
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>All Pending</h2>
          <div className="input-wrap" style={{ minWidth: 220 }}>
            <Search size={16} />
            <input
              className="input"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner dark" style={{ margin: '0 auto' }} />
          </div>
        ) : pending.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <ListTodo size={28} />
            </div>
            <h3>You're all caught up</h3>
            <p>No pending tasks match your search. Add a new one to get started.</p>
          </div>
        ) : (
          <div className="task-list">
            {pending.map((task) => (
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
      </div>

      {showModal && <TaskModal onClose={() => setShowModal(false)} onSubmit={handleCreate} />}
      {editingTask && (
        <TaskModal initialTask={editingTask} onClose={() => setEditingTask(null)} onSubmit={handleEditSubmit} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}
