# E-Commerce Slot Booking & Delivery Scheduling System

A full-stack web application built for hyper-local delivery scheduling. Dispatchers can add drivers, lock orders into delivery runs, and track capacity dynamically.

## Tech Stack
* **Frontend:** React.js, Vite, Axios
* **Backend:** Node.js, Express.js
* **Database:** SQLite

## Features
* **Live Status Dashboard**: Monitors delivery driver capacity in real-time. Runs nearing capacity (80%) highlight in amber, and full runs (100%) highlight in red.
* **Log Entry Form**: Allows booking orders into available shifts. Protects against booking orders into full shifts.
* **Dynamic Driver Addition**: Dispatchers can create and save new driver shifts instantly to the database.
* **History Feed**: Displays a live feed of the last 10 dispatch allocations.

---

## Local Setup

### 1. Start the Backend
```bash
cd backend
npm install
npm run dev
```
*(Runs on port 3001. A `database.db` SQLite file will be automatically generated with seed data).*

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
*(Runs on Vite, usually port 5173).*

---

## Deployment Guide (Netlify & Render)

Since SQLite requires a persistent filesystem (and Serverless platforms like Netlify wipe files periodically), the recommended deployment strategy is a split-stack:

### 1. Deploy Backend to Render.com
1. Create an account on Render.com and select **New Web Service**.
2. Connect this repository.
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. Note the deployment URL (e.g., `https://my-backend.onrender.com`).

### 2. Deploy Frontend to Netlify
1. Create an account on Netlify and select **Add New Site** > Import from GitHub.
2. Select this repository.
3. **Base Directory:** `frontend`
4. **Build Command:** `npm run build`
5. **Publish Directory:** `frontend/dist`
6. **Environment Variables:** Add a new variable called `VITE_API_URL` and set its value to your Render backend URL (e.g., `https://my-backend.onrender.com`).
7. Click **Deploy Site**.

*Note: You may need to update the `cors()` configuration in `backend/server.js` if you want to strictly restrict API access to only your Netlify domain in production.*
