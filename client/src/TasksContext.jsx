import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from './api';
import { useAuth } from './AuthContext';

const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (e) {
      // ignore — handled by individual pages if needed
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) refresh();
    else {
      setTasks([]);
      setLoading(false);
    }
  }, [user, refresh]);

  const createTask = async (payload) => {
    const newTask = await api.createTask(payload);
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = async (id, payload) => {
    const updated = await api.updateTask(id, payload);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    return updated;
  };

  const deleteTask = async (id) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TasksContext.Provider value={{ tasks, loading, refresh, createTask, updateTask, deleteTask }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  return useContext(TasksContext);
}
