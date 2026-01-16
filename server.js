// Main server file for LearningEdge backend application
const express = require('express');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Database and cloudinary connections
const { connectDB } = require('./config/database');
const { cloudinaryConnect } = require('./config/cloudinary');

// Route imports
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const paymentRoutes = require('./routes/payments');
const courseRoutes = require('./routes/course');

// Initialize services
let dbConnected = false;

const initializeServices = async () => {
    if (!dbConnected) {
        try {
            await connectDB();
            cloudinaryConnect();
            dbConnected = true;
            console.log('Services initialized');
        } catch (error) {
            console.error('Service initialization failed:', error.message);
            dbConnected = false;
        }
    }
};

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        "https://frontend-one-neon-90.vercel.app",
        "http://localhost:3000",
        "http://localhost:5000"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp'
}));

// Middleware to ensure database connection before handling requests
app.use(async (req, res, next) => {
    try {
        await initializeServices();
        next();
    } catch (error) {
        console.error('DB connection middleware error:', error);
        return res.status(503).json({
            success: false,
            message: 'Service temporarily unavailable',
            error: error.message
        });
    }
});

// Routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/course', courseRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'LearningEdge Backend Server is running'
    });
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
    console.error('Request error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Export for Vercel
module.exports = app;

// Local development
if (process.env.VERCEL === undefined) {
    initializeServices().then(() => {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    });
}