# 🚀 Steps to Start the Project

This guide will help you run the Three-Tier Web Application (React + Node.js + MongoDB) locally on your machine.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use MongoDB Atlas (cloud)

To verify installations:
```bash
node --version
npm --version
mongod --version  # If MongoDB is installed locally
```

---

## 🗄️ Step 1: Set Up MongoDB

### Option A: Local MongoDB Installation

1. **Install MongoDB** on your system
   - Windows: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Mac: `brew install mongodb-community`
   - Linux: Follow [MongoDB Installation Guide](https://www.mongodb.com/docs/manual/installation/)

2. **Start MongoDB Service**
   ```bash
   # Windows (Run as Administrator)
   net start MongoDB
   
   # Mac/Linux
   sudo systemctl start mongod
   # OR
   mongod
   ```

3. **Verify MongoDB is running**
   ```bash
   mongosh
   # You should see MongoDB shell prompt
   ```

### Option B: MongoDB Atlas (Cloud - Recommended for beginners)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)

---

## 🔧 Step 2: Configure Backend Environment

1. **Navigate to the backend directory**
   ```bash
   cd Application-Code/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the `Application-Code/backend` directory:
   ```env
   # MongoDB Connection String
   # For local MongoDB:
   # MONGO_CONN_STR=mongodb://localhost:27017/todo?directConnection=true
   
   # For MongoDB Atlas (replace with your connection string):
   # IMPORTANT: URL encode special characters in password (@ becomes %40, : becomes %3A)
   MONGO_CONN_STR=mongodb+srv://username:password@cluster.mongodb.net/todo?retryWrites=true&w=majority
   
   # MongoDB Authentication (set to false when credentials are in connection string)
   USE_DB_AUTH=false
   
   # MongoDB Username (only needed if USE_DB_AUTH=true)
   MONGO_USERNAME=admin
   
   # MongoDB Password (only needed if USE_DB_AUTH=true)
   MONGO_PASSWORD=password123
   
   # Server Port (default: 3500)
   PORT=3500
   ```
   
   **Example with MongoDB Atlas:**
   ```env
   # If your password contains special characters, URL encode them
   # Password "Ampuboss@1" becomes "Ampuboss%401"
   MONGO_CONN_STR=mongodb+srv://username:Ampuboss%401@cluster.mongodb.net/todo?retryWrites=true&w=majority
   USE_DB_AUTH=false
   PORT=3500
   ```
   
   **⚠️ Note:** I've already created `.env` files for you with your MongoDB Atlas connection string configured!

---

## 🖥️ Step 3: Start the Backend Server

1. **Make sure you're in the backend directory**
   ```bash
   cd Application-Code/backend
   ```

2. **Start the server**
   ```bash
   node index.js
   ```

   Or if you want to add a start script, you can add this to `package.json`:
   ```json
   "scripts": {
     "start": "node index.js",
     "dev": "nodemon index.js"
   }
   ```
   Then run: `npm start`

3. **Verify backend is running**
   - You should see: `Listening on port 3500...`
   - You should see: `Connected to database.`
   - Test the health endpoint: Open browser to `http://localhost:3500/healthz`
   - Should display: `Healthy`

---

## 🎨 Step 4: Configure and Start Frontend

1. **Navigate to the frontend directory**
   ```bash
   cd Application-Code/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   ⚠️ **Note**: This may take a few minutes as React dependencies are large.

3. **Set up environment variables**

   Create a `.env` file in the `Application-Code/frontend` directory:
   ```env
   # Backend API URL
   REACT_APP_BACKEND_URL=http://localhost:3500/api/tasks
   ```

4. **Start the frontend development server**
   ```bash
   npm start
   ```

   The React development server will:
   - Start on `http://localhost:3000`
   - Automatically open in your browser
   - Hot-reload when you make changes

---

## ✅ Step 5: Verify Everything is Working

1. **Backend Health Check**
   - Open: `http://localhost:3500/healthz` → Should show "Healthy"
   - Open: `http://localhost:3500/ready` → Should show "Ready" (if MongoDB is connected)

2. **Frontend Application**
   - Open: `http://localhost:3000`
   - You should see the Task Manager application
   - Try creating a new task to test the full flow

3. **API Test**
   - Backend API: `http://localhost:3500/api/tasks`
   - Frontend connects to: `http://localhost:3500/api/tasks`

---

## 🔍 Troubleshooting

### Backend Issues

**Problem: Cannot connect to database**
- ✅ Check MongoDB is running: `mongosh` or `mongo`
- ✅ Verify `MONGO_CONN_STR` in `.env` is correct
- ✅ Check MongoDB port (default: 27017)
- ✅ For MongoDB Atlas: Ensure your IP is whitelisted

**Problem: Port already in use**
- ✅ Change `PORT` in `.env` to a different port (e.g., 3501)
- ✅ Update frontend `.env` to match: `REACT_APP_BACKEND_URL=http://localhost:3501/api/tasks`

### Frontend Issues

**Problem: Cannot connect to backend**
- ✅ Ensure backend is running on port 3500
- ✅ Check `REACT_APP_BACKEND_URL` in frontend `.env`
- ✅ Check browser console for CORS errors (backend should have CORS enabled)

**Problem: npm install fails**
- ✅ Try: `npm cache clean --force`
- ✅ Delete `node_modules` and `package-lock.json`, then run `npm install` again
- ✅ Check Node.js version: `node --version` (should be v14+)

**Problem: Error: error:0308010C:digital envelope routines::unsupported**
- ✅ This occurs with Node.js v17+ and react-scripts 4.x
- ✅ **Solution**: The `package.json` has been updated with `cross-env` to use the legacy OpenSSL provider
- ✅ If you still see this error, manually set: `$env:NODE_OPTIONS="--openssl-legacy-provider"` in PowerShell before running `npm start`
- ✅ Alternative: Downgrade to Node.js v16 or upgrade react-scripts to v5.x

---

## 📝 Quick Start Commands Summary

```bash
# Terminal 1: Start MongoDB (if local)
mongod

# Terminal 2: Start Backend
cd Application-Code/backend
npm install
# Create .env file with MONGO_CONN_STR
node index.js

# Terminal 3: Start Frontend
cd Application-Code/frontend
npm install
# Create .env file with REACT_APP_BACKEND_URL
npm start
```

---

## 🐳 Alternative: Using Docker (Optional)

If you prefer using Docker, you can build and run the containers:

### Backend Docker
```bash
cd Application-Code/backend
docker build -t backend-app .
docker run -p 3500:3500 -e MONGO_CONN_STR=mongodb://host.docker.internal:27017/todo backend-app
```

### Frontend Docker
```bash
cd Application-Code/frontend
docker build -t frontend-app .
docker run -p 3000:80 -e REACT_APP_BACKEND_URL=http://localhost:3500/api/tasks frontend-app
```

---

## 🎯 Next Steps

Once the application is running locally:

1. **Explore the code**:
   - Frontend: `Application-Code/frontend/src/`
   - Backend: `Application-Code/backend/`

2. **Test the application**:
   - Create, update, and delete tasks
   - Test filtering and sorting
   - Check statistics dashboard

3. **Deploy to Kubernetes**:
   - Refer to `Kubernetes-Manifests-file/` directory
   - See `README.md` for deployment guide

4. **Set up CI/CD**:
   - Check `Jenkins-Pipeline-Code/` for Jenkins pipelines
   - Review `Jenkins-Server-TF/` for infrastructure setup

---

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/docs/)

---

**Happy Coding! 🚀**


