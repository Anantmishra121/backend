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

// Initialize database and cloudinary
connectDB().catch(err => console.error('DB init error:', err));
cloudinaryConnect();

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
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Server error',
        error: err.message
    });
});

// Export for Vercel
module.exports = app;

// Local development
if (process.env.VERCEL === undefined) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}