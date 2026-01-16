// Main server file for LearningEdge backend application
const express = require('express')
const app = express();

// Third-party packages
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cors = require('cors');
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
        origin: function (origin, callback) {
            const allowedOrigins = [
                "https://frontend-one-neon-90.vercel.app",
                "http://localhost:3000",
                "http://localhost:5000",
                process.env.FRONTEND_URL
            ];
            
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true
    })
);
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp'
    })
)

// Establish connections
connectDB();
cloudinaryConnect();

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

// Only listen if not in Vercel serverless environment
if (process.env.VERCEL === undefined) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server Started on PORT ${PORT}`);
    });
}

// Export for Vercel serverless functions
module.exports = app;