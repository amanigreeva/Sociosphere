# SocioSphere

SocioSphere is a full-stack social media application built with the MERN stack (MongoDB, Express, React, Node.js). It features real-time messaging, post creation, user authentication, and more.

## Features

- **User Authentication**: Secure signup and login.
- **Create Posts**: Share thoughts and images.
- **Real-time Chat**: Message friends instantly.
- **Profile Management**: Update your profile and settings.
- **Responsive Design**: Works on mobile and desktop.

## Tech Stack

- **Frontend**: React, Vite, Material UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time**: Socket.io

## Deployment Instructions (Render)

This project is set up to be easily deployed on [Render](https://render.com).

### 1. Database Setup (MongoDB Atlas)
1.  Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a new Cluster.
3.  In "Database Access", create a database user.
4.  In "Network Access", allow access from anywhere (`0.0.0.0/0`).
5.  Get your connection string (keep it safe!).

### 2. Backend Deployment (Web Service)
1.  Go to the [Render Dashboard](https://dashboard.render.com).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  **Settings**:
    - **Name**: `sociosphere-backend` (or similar)
    - **Root Directory**: `backend`
    - **Runtime**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `node src/server.js`
5.  **Environment Variables**:
    - `MONGO_URI`: *Your MongoDB Connection String*
    - `JWT_SECRET`: *A secure random string*
    - `PORT`: `10000`
    - `CLIENT_URL`: *Leave this blank for now, we will update it after deploying frontend*
6.  Click **Create Web Service**.

### 3. Frontend Deployment (Static Site)
1.  Go back to Render Dashboard.
2.  Click **New +** -> **Static Site**.
3.  Connect the **SAME** GitHub repository.
4.  **Settings**:
    - **Name**: `sociosphere-frontend`
    - **Root Directory**: `frontend`
    - **Build Command**: `npm install && npm run build`
    - **Publish Directory**: `dist`
5.  **Environment Variables**:
    - `VITE_API_URL`: *The URL of your backend service (e.g., https://sociosphere-backend.onrender.com)*
6.  Click **Create Static Site**.

### 4. Final Configuration
1.  Copy the URL of your new **Frontend** site (e.g., `https://sociosphere-frontend.onrender.com`).
2.  Go back to your **Backend Service** settings on Render.
3.  Update the `CLIENT_URL` environment variable with your Frontend URL.
4.  **Redeploy** the backend if necessary.

Done! Your app is live.
