const mongoose = require('mongoose');
require('dotenv').config();

let isConnected = false;

// Function to connect to the MongoDB database
exports.connectDB = async () => {
    // If already connected, return early
    if (mongoose.connection.readyState === 1) {
        console.log('Database connection is ready');
        isConnected = true;
        return;
    }
    
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'NOT SET');
        
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL environment variable is not set');
        }
        
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        isConnected = true;
        console.log('✓ Database connected successfully');
        return mongoose;
    } catch (error) {
        console.error('✗ Database connection error:', error.message);
        isConnected = false;
        throw error;
    }
};

