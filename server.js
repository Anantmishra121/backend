// Main server file for LearningEdge backend application
const express = require('express')
const app = express();

// Third-party packages
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Database and cloudinary connections
const { connectDB } = require('./config/database');
const { cloudinaryConnect } = require('./config/cloudinary');

// Route imports
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const paymentRoutes = require('./routes/payments');
const courseRoutes = require('./routes/course');

// Middleware setup
app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser());
app.use(
    cors({
        origin: [
            "https://frontend-one-neon-90.vercel.app",
            "http://localhost:3000",
            "http://localhost:5000"
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    })
);
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp'
    })
)

// Establish connections
(async () => {
    try {
        await connectDB();
        cloudinaryConnect();
        console.log('All services initialized');
    } catch (error) {
        console.error('Service initialization error:', error.message);
    }
})();

// Add error handler for unhandled database errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

// Middleware to ensure DB connection on each request (for serverless)
app.use(async (req, res, next) => {
    try {
        // Ensure database is connected before processing request
        if (mongoose.connection.readyState !== 1) {
            await connectDB();
        }
        next();
    } catch (error) {
        console.error('DB connection error:', error.message);
        return res.status(503).json({
            success: false,
            message: 'Database service unavailable',
            error: error.message
        });
    }
});

// Mount routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/course', courseRoutes);

// Default route
app.get('/', (req, res) => {
    res.send(`<div>
    <h1>LearningEdge Backend Server</h1>
    <p>Server is running successfully!</p>
    </div>`);
})

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
    });
});

// Only listen if not in Vercel serverless environment
if (process.env.VERCEL === undefined) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server Started on PORT ${PORT}`);
    });
}

// Export for Vercel serverless functions
module.exports = app;