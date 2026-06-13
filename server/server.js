require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET =  process.env.JWT_SECRET;

const usersFile = path.join(__dirname, 'data', 'users.json');
const tasksFile = path.join(__dirname, 'data', 'tasks.json');

const readJSON = (file) => JSON.parse(fs.readFileSync(file, 'utf-8'));
const writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// --- Auth middleware ---
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// --- Auth routes ---
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  const users = readJSON(usersFile);
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: Date.now(),
    name,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  writeJSON(usersFile, users);

  const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const users = readJSON(usersFile);
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const users = readJSON(usersFile);
  const user = users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

app.put('/api/auth/me', authenticate, (req, res) => {
  const { name, email } = req.body;
  const users = readJSON(usersFile);
  const idx = users.findIndex((u) => u.id === req.userId);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  if (email && email.toLowerCase() !== users[idx].email.toLowerCase()) {
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(409).json({ error: 'Email already in use' });
    }
  }
  users[idx] = { ...users[idx], name: name ?? users[idx].name, email: email ?? users[idx].email };
  writeJSON(usersFile, users);
  res.json({ user: { id: users[idx].id, name: users[idx].name, email: users[idx].email } });
});

app.put('/api/auth/password', authenticate, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  const users = readJSON(usersFile);
  const idx = users.findIndex((u) => u.id === req.userId);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  if (!bcrypt.compareSync(currentPassword, users[idx].password)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  users[idx].password = bcrypt.hashSync(newPassword, 10);
  writeJSON(usersFile, users);
  res.json({ ok: true });
});

app.delete('/api/auth/me', authenticate, (req, res) => {
  let users = readJSON(usersFile);
  users = users.filter((u) => u.id !== req.userId);
  writeJSON(usersFile, users);
  let tasks = readJSON(tasksFile);
  tasks = tasks.filter((t) => t.userId !== req.userId);
  writeJSON(tasksFile, tasks);
  res.json({ ok: true });
});

// --- Task routes (scoped to authenticated user) ---
app.get('/api/tasks', authenticate, (req, res) => {
  const tasks = readJSON(tasksFile)
    .filter((t) => t.userId === req.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(tasks);
});

app.post('/api/tasks', authenticate, (req, res) => {
  const { title, description, priority, dueDate, status } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Task title is required' });
  }
  const tasks = readJSON(tasksFile);
  const now = new Date();
  const newTask = {
    id: Date.now(),
    userId: req.userId,
    title: title.trim(),
    description: description || '',
    priority: priority || 'Low',
    status: status || 'In Progress',
    completed: status === 'Completed',
    dueDate: dueDate || null,
    createdAt: now.toISOString(),
  };
  tasks.push(newTask);
  writeJSON(tasksFile, tasks);
  res.json(newTask);
});

app.put('/api/tasks/:id', authenticate, (req, res) => {
  const tasks = readJSON(tasksFile);
  const idx = tasks.findIndex((t) => t.id == req.params.id && t.userId === req.userId);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });

  const updates = { ...req.body };
  if (updates.status) {
    updates.completed = updates.status === 'Completed';
  } else if (typeof updates.completed === 'boolean') {
    updates.status = updates.completed ? 'Completed' : 'In Progress';
  }
  tasks[idx] = { ...tasks[idx], ...updates, updatedAt: new Date().toISOString() };
  writeJSON(tasksFile, tasks);
  res.json(tasks[idx]);
});

app.delete('/api/tasks/:id', authenticate, (req, res) => {
  let tasks = readJSON(tasksFile);
  const exists = tasks.find((t) => t.id == req.params.id && t.userId === req.userId);
  if (!exists) return res.status(404).json({ error: 'Task not found' });
  tasks = tasks.filter((t) => !(t.id == req.params.id && t.userId === req.userId));
  writeJSON(tasksFile, tasks);
  res.json({ ok: true });
});

// const PORT = 5000;
// app.listen(PORT, () => console.log(`TaskFlow server running on http://localhost:${PORT}`));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`TaskFlow server running on port ${PORT}`);
});
