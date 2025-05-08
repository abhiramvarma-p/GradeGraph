const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const BRANCH_OPTIONS = [
    'Computer Science & Engineering (CSE)',
    'Artificial Intelligence (AI)',
    'Electronics & Computer Engineering (ECM)',
    'Computation & Mathematics (CM)',
    'Mechanical Engineering (ME)',
    'Mechatronics (MT)',
    'Civil Engineering (CE)',
    'Nano Technology (NT)',
    'Electronics and Communication Engineering (ECE)',
    'Bio Technology',
    'Computational Biology (CB)',
    'Aerospace (Aero)',
    'Electrical and Computer Engineering (ELC)',
    'VLSI Design and Technology (VLSI)',
    '5 Yr. M.Tech- Computer Science and Engineering',
    '5 Yr. Integrated M.Tech -Biotechnology'
];

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['student', 'educator', 'admin'],
        required: true
    },
    // Common fields
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        required: false
    },
    // Student specific fields
    collegeId: {
        type: String,
        required: function() {
            return this.role === 'student';
        }
    },
    branch: {
        type: String,
        required: function() {
            return this.role === 'student';
        },
        enum: BRANCH_OPTIONS
    },
    graduationYear: {
        type: Number,
        required: function() {
            return this.role === 'student';
        }
    },
    course: {
        type: String,
        required: false
    },
    // Educator specific fields
    department: {
        type: String,
        required: function() {
            return this.role === 'educator';
        }
    },
    designation: {
        type: String,
        required: function() {
            return this.role === 'educator';
        }
    },
    // Admin specific fields
    accessLevel: {
        type: String,
        required: function() {
            return this.role === 'admin';
        }
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

const User = mongoose.model('User', userSchema);

module.exports = { User, BRANCH_OPTIONS }; 