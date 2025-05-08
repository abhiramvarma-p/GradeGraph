const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Check if token is about to expire (within 5 minutes)
            const tokenExp = decoded.exp * 1000; // Convert to milliseconds
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;
            
            if (tokenExp - now < fiveMinutes) {
                // Token is about to expire, generate a new one
                const user = await User.findById(decoded.userId);
                if (user) {
                    const newToken = jwt.sign(
                        { userId: user._id, role: user.role },
                        process.env.JWT_SECRET,
                        { expiresIn: '24h' }
                    );
                    res.setHeader('X-New-Token', newToken);
                }
            }

            const user = await User.findById(decoded.userId);
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            req.user = user;
            req.token = token;
            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    message: 'Token has expired',
                    code: 'TOKEN_EXPIRED'
                });
            }
            throw jwtError;
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ 
            message: 'Invalid or malformed token',
            code: 'INVALID_TOKEN'
        });
    }
};

// Middleware to check user role
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                message: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access denied. This action requires ${roles.join(' or ')} role.`,
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }
        next();
    };
};

module.exports = { auth, checkRole }; 