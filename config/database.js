const mongoose = require('mongoose');
require('dotenv').config();

let isConnected = false;

// Function to connect to the MongoDB database
exports.connectDB = async () => {
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }
    
    try {
        console.log('Attempting to connect to database...');
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 5,
            minPoolSize: 1,
        });
        
        isConnected = true;
        console.log('Database connected successfully');
        return mongoose;
    } catch (error) {
        console.error(`Error while connecting server with Database:`, error.message);
        isConnected = false;
        throw error;
    }
};

