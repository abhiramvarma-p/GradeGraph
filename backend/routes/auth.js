const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User, BRANCH_OPTIONS } = require('../models/User');

// Get branch options
router.get('/branches', (req, res) => {
    res.json(BRANCH_OPTIONS);
});

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, role, firstName, lastName, ...roleSpecificData } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({
            email,
            password,
            role,
            firstName,
            lastName,
            ...roleSpecificData
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Error registering user', 
            error: error.message 
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and include password field
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            message: 'Login successful',
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Error logging in', 
            error: error.message 
        });
    }
});

// Validate token
router.get('/validate-token', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ valid: false });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);
            
            if (!user) {
                return res.status(401).json({ valid: false });
            }

            // Check if token is about to expire (within 5 minutes)
            const tokenExp = decoded.exp * 1000;
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;
            
            if (tokenExp - now < fiveMinutes) {
                // Generate new token
                const newToken = jwt.sign(
                    { userId: user._id, role: user.role },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );
                res.setHeader('X-New-Token', newToken);
            }

            res.json({ valid: true });
        } catch (jwtError) {
            res.status(401).json({ valid: false });
        }
    } catch (error) {
        console.error('Token validation error:', error);
        res.status(401).json({ valid: false });
    }
});

module.exports = router; 