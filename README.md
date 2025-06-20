# 🗳️ Live Polling System – Intervue Assignment

A real-time polling system built with **React**, **Vite**, **Redux Toolkit**, **Tailwind CSS**, and **Socket.IO**, integrated with an Express.js backend.

## 🌐 Live Demo

- **Frontend**: [https://intervue-assignment-green.vercel.app/](https://intervue-assignment-green.vercel.app/)
- **Backend API**: [https://intervue-assignment-m134.onrender.com/](https://intervue-assignment-m134.onrender.com/)

> 🔗 GitHub Repo: [github.com/abhisoni1921/Intervue-Assignment](https://github.com/abhisoni1921/Intervue-Assignment)

---

## 🧰 Tech Stack

### Frontend
- ⚛️ React 18 (w/ TypeScript)
- ⚡ Vite
- 🧠 Redux Toolkit
- 💅 Tailwind CSS
- 📊 Chart.js & Recharts
- 🔌 Socket.IO Client

### Backend
- 🚂 Express.js
- 🔌 Socket.IO Server
- 🛡️ CORS Enabled

---


---

## ⚙️ Setup Instructions

### 🔧 Prerequisites
- Node.js v18+
- npm

### 📦 Installation

```bash
git clone https://github.com/abhisoni1921/Intervue-Assignment.git
cd Intervue-Assignment
npm install

🛠️ Available Scripts
Script	Description
npm run dev:	Run frontend and backend in dev mode
npm run build:	Build frontend for production
npm run preview:	Preview production build locally
npm run lint:	Run ESLint to check code quality

🔌 Real-time Functionality
Uses Socket.IO for real-time communication.

Socket logic encapsulated in src/hooks/useSocket.ts

Server emits & listens to polling events to update UI instantly.
