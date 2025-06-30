# Network Setup Guide

## Automatic Environment Detection

The application now automatically detects your environment and configures the backend URL accordingly:

### 🏠 **Localhost Development**
- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:5000`
- **Automatic**: ✅ No configuration needed

### 🌐 **LAN Development** 
- **Frontend**: `http://192.168.1.100:5173` (your LAN IP)
- **Backend**: `http://192.168.1.100:5000` (same LAN IP)
- **Automatic**: ✅ No configuration needed

### 🔗 **Tunneled Development** (ngrok, localtunnel)
- **Frontend**: `https://abc123.ngrok.io`
- **Backend**: Use environment variable `VITE_API_BASE_URL`
- **Manual**: Set `VITE_API_BASE_URL=https://your-backend-url.ngrok.io/api/v1`

## How to Use

### 1. **Localhost Development**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev

# Access: http://localhost:5173
```

### 2. **LAN Development**
```bash
# Get your LAN IP
# Windows: ipconfig
# Mac/Linux: ifconfig or ip addr

# Start backend on all interfaces
cd backend
npm start  # Already configured to listen on 0.0.0.0:5000

# Start frontend on all interfaces  
cd frontend
npm run dev  # Already configured in vite.config.ts

# Access from any device on your network:
# http://YOUR_LAN_IP:5173
```

### 3. **Tunneled Development**
```bash
# Install ngrok
npm install -g ngrok

# Start your applications
cd backend && npm start
cd frontend && npm run dev

# Create tunnels
ngrok http 5000  # Backend
ngrok http 5173  # Frontend

# Set environment variable for backend URL
# Create frontend/.env.local:
VITE_API_BASE_URL=https://your-backend-ngrok-url.ngrok.io/api/v1
```

## Environment Detection Logic

The system automatically detects:

1. **localhost/127.0.0.1** → Backend: `localhost:5000`
2. **LAN IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x)** → Backend: `same-ip:5000`
3. **Tunneled URL** → Backend: Uses `VITE_API_BASE_URL` environment variable
4. **Fallback** → Backend: `localhost:5000`

## Console Logging

Check your browser console to see:
- 🌐 Environment detected
- 🌐 Network Info
- Current backend URL being used

## Troubleshooting

### Backend not accessible on LAN
- Ensure backend is running on `0.0.0.0:5000` (already configured)
- Check firewall settings
- Verify both devices are on same network

### CORS errors
- Backend CORS is already configured for common scenarios
- For custom domains, add them to `allowedOrigins` in `backend/server.js`

### Environment variable not working
- Create `.env.local` file in frontend directory
- Restart the development server
- Check console for environment detection logs 