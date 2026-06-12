# Task Manager

A simple, polished task manager with user accounts, priorities, due dates, and progress tracking.

## Features

- Sign up / log in with a personal account (passwords hashed, JWT auth)
- Dashboard with task stats, productivity progress, filters, and recent activity
- Create tasks with title, description, priority, due date, and status — each task records its created date and time automatically
- Pending Tasks and Completed Tasks views with search
- Edit and delete tasks
- Account settings: update profile, change password, logout, delete account

## Project structure

```
task/
  server/   → Express + JSON file storage API (port 5000)
  client/   → React + Vite frontend (port 5173)
```

## Setup

### 1. Backend

```bash
cd server
npm install
npm start
```

Runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Runs on `http://localhost:5173`.

## Notes

- User and task data is stored in `server/data/users.json` and `server/data/tasks.json`.
- Each user only sees their own tasks.
- Update `JWT_SECRET` in `server/server.js` before deploying anywhere real.
