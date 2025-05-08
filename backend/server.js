const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection Options
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

// Connect to MongoDB with detailed error handling
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gradegraph', mongooseOptions)
    .then(() => {
        console.log('Successfully connected to MongoDB.');
        console.log('Connection string:', process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gradegraph');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        console.error('Connection string:', process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gradegraph');
        process.exit(1);
    });

// Get the default connection
const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
    console.log('MongoDB database connection established successfully');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/scores', require('./routes/scores'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/courses', require('./routes/courses'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    console.error('Stack:', err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 