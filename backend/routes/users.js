const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const { User } = require('../models/User');

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['firstName', 'lastName', 'email', 'profilePicture'];
        
        // Add role-specific fields
        if (req.user.role === 'student') {
            allowedUpdates.push('collegeId', 'branch');
        } else if (req.user.role === 'educator') {
            allowedUpdates.push('department', 'designation');
        } else if (req.user.role === 'admin') {
            allowedUpdates.push('accessLevel');
        }

        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }

        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();

        res.json(req.user);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(400).json({ message: 'Error updating profile', error: error.message });
    }
});

// Get all users (admin only)
router.get('/', auth, checkRole(['admin']), async (req, res) => {
    try {
        console.log('Fetching all users...');
        const users = await User.find({}).select('-password');
        console.log(`Found ${users.length} users`);
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// Get students by branch and graduation year (educator or admin only)
router.get('/students', auth, checkRole(['educator', 'admin']), async (req, res) => {
    try {
        const { branch, graduationYear } = req.query;
        
        if (!branch || !graduationYear) {
            return res.status(400).json({ message: 'Branch and graduation year are required' });
        }

        const students = await User.find({
            role: 'student',
            branch,
            graduationYear: parseInt(graduationYear)
        }).select('-password');

        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Error fetching students', error: error.message });
    }
});

// Delete user (admin only)
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

module.exports = router; 