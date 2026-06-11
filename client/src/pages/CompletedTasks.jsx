import React, { useMemo, useState } from 'react';
import { CheckCircle2, Search } from 'lucide-react';
import Layout from '../components/Layout';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import Toast from '../components/Toast';
import { useTasks } from '../TasksContext';

export default function CompletedTasks() {
  const { tasks, loading, updateTask, deleteTask } = useTasks();
  const [search, setSearch] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [toast, setToast] = useState(null);

  const completed = useMemo(() => {
    return tasks
      .filter((t) => t.completed)
      .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
  }, [tasks, search]);

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
      await updateTask(task.id, { completed: false, status: 'In Progress' });
      setToast({ message: 'Moved back to pending', type: 'success' });
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
            <CheckCircle2 size={24} />
            Completed Tasks
          </h1>
          <p>{completed.length} task{completed.length !== 1 ? 's' : ''} done — nice work</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>All Completed</h2>
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
        ) : completed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <CheckCircle2 size={28} />
            </div>
            <h3>Nothing completed yet</h3>
            <p>Finish a task and it will show up here.</p>
          </div>
        ) : (
          <div className="task-list">
            {completed.map((task) => (
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

      {editingTask && (
        <TaskModal initialTask={editingTask} onClose={() => setEditingTask(null)} onSubmit={handleEditSubmit} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}
