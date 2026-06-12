# TaskFlow — Task Manager

## 1. Project Title & Brief Description

**TaskFlow** is a full-stack task management web app built as the "Task Manager" exercise. It provides personal user accounts (signup/login with hashed passwords and JWT auth), a dashboard with task statistics and productivity progress, and full CRUD for tasks with title, description, priority, due date, and status. Users can browse Pending and Completed tasks with search, edit/delete tasks, and manage their account (update profile, change password, delete account) from a Settings page. The backend is an Express API backed by JSON file storage, and the frontend is a React + Vite SPA.

## 2. Live Demo Links

- Frontend: _add your deployed frontend URL here_
- Backend API: _add your deployed backend URL here_

## 3. Tech Stack

**Frontend**
- React 18 + Vite — fast dev server and build tooling for the SPA
- React Router DOM — client-side routing between Dashboard, Pending/Completed Tasks, Login/Signup, Settings
- lucide-react — icon set used throughout the UI
- Context API (`AuthContext`, `TasksContext`) — global auth and task state
- Plain CSS (`style.css`) — styling

**Backend**
- Express — REST API server
- bcryptjs — password hashing
- jsonwebtoken (JWT) — authentication tokens
- cors — cross-origin requests from the Vite dev server
- JSON file storage (`data/users.json`, `data/tasks.json`) — simple persistence, no external database

## 4. How to Run Locally

Requires only Node.js installed.

```bash
# 1. Clone/extract the project, then from the project root:

# 2. Start the backend
cd server
npm install
npm start
# Backend runs on http://localhost:5000

# 3. In a new terminal, start the frontend
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

Open `http://localhost:5173` in your browser. Sign up for a new account to get started.

## 5. API Documentation

All task routes and `/api/auth/me`, `/api/auth/password`, and account deletion require an `Authorization: Bearer <token>` header.

### Auth

| Method | Path | Request Body | Response |
|--------|------|---------------|----------|
| POST | `/api/auth/signup` | `{ name, email, password }` | `{ token, user: { id, name, email } }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ token, user: { id, name, email } }` |
| GET | `/api/auth/me` | — | `{ user: { id, name, email } }` |
| PUT | `/api/auth/me` | `{ name?, email? }` | `{ user: { id, name, email } }` |
| PUT | `/api/auth/password` | `{ currentPassword, newPassword }` | `{ ok: true }` |
| DELETE | `/api/auth/me` | — | `{ ok: true }` (deletes user and their tasks) |

### Tasks

| Method | Path | Request Body | Response |
|--------|------|---------------|----------|
| GET | `/api/tasks` | — | Array of task objects (current user's tasks, newest first) |
| POST | `/api/tasks` | `{ title, description?, priority?, dueDate?, status? }` | Created task object |
| PUT | `/api/tasks/:id` | Partial task fields, e.g. `{ status, title, ... }` | Updated task object |
| DELETE | `/api/tasks/:id` | — | `{ ok: true }` |

**Task object shape**

```json
{
  "id": 1718000000000,
  "userId": 1718000000001,
  "title": "Finish README",
  "description": "Write tailored project README",
  "priority": "Low | Medium | High",
  "status": "In Progress | Completed | ...",
  "completed": false,
  "dueDate": "2026-06-20",
  "createdAt": "2026-06-12T12:00:00.000Z",
  "updatedAt": "2026-06-12T13:00:00.000Z"
}
```

## 6. Project Structure

```
task/
  server/                 → Express + JSON file storage API (port 5000)
    server.js             → All routes: auth + tasks
    data/
      users.json          → User records (hashed passwords)
      tasks.json          → Task records, scoped by userId
  client/                 → React + Vite frontend (port 5173)
    src/
      App.jsx             → Routes/layout entry point
      AuthContext.jsx     → Auth state, login/signup/logout
      TasksContext.jsx    → Task state and CRUD helpers
      api.js              → Fetch wrapper for backend API
      components/
        Layout.jsx        → App shell/navigation
        TaskCard.jsx       → Single task display
        TaskModal.jsx      → Create/edit task form
        Toast.jsx          → Notifications
      pages/
        Dashboard.jsx      → Stats, progress, recent activity
        PendingTasks.jsx   → Pending tasks list + search
        CompletedTasks.jsx → Completed tasks list + search
        Login.jsx / Signup.jsx → Auth forms
        Settings.jsx       → Profile, password, account deletion
      style.css            → Global styles
```

## 7. Next Steps

What was not built, and what would come next:

- **Database**: replace JSON file storage with a real database (e.g. PostgreSQL or MongoDB) for concurrency safety and scalability.
- **Environment variables**: move `JWT_SECRET` and the API base URL into `.env` files instead of hardcoding them.
- **Validation & error handling**: add stronger server-side validation (e.g. with Zod/Joi) and more granular error responses.
- **Testing**: add unit/integration tests for the API routes and key React components.
- **Task features**: subtasks, tags/labels, sorting options, recurring tasks, and reminders/notifications for due dates.
- **Pagination**: paginate task lists for users with large numbers of tasks.
- **Deployment**: containerize with Docker and deploy frontend/backend (e.g. Vercel/Render) with HTTPS.
