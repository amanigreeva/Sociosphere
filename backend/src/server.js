// backend/src/server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { register } = require('./utils/metrics');
const logger = require('./utils/logger');
const http = require('http'); // Import http for socket.io integration

// Load environment variables
require('dotenv').config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app); // Create HTTP server

// Prometheus Registry
// (imported above)

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
    exposedHeaders: ['x-auth-token']
}));

// Request Logger
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl} - ${req.ip}`);
    next();
});

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Initialize Socket.IO
const io = require("socket.io")(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
    },
});

require("./sockets")(io);

// Make io accessible to our router
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Metrics Endpoint
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (ex) {
        res.status(500).end(ex);
    }
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/conversations', require('./routes/conversationRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes')); // Analytics Route
app.use('/api/streams', require('./routes/streamRoutes')); // Stream Routes
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});