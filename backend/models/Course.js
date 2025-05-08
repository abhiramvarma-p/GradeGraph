const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    branch: {
        type: String,
        required: true,
        enum: [
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
        ]
    },
    credits: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    courseType: {
        type: String,
        required: true,
        enum: ['core', 'elective']
    },
    maxScore: {
        type: Number,
        required: true,
        default: 100
    },
    isActive: {
        type: Boolean,
        default: true
    },
    batchYear: {
        type: Number,
        required: true
    },
    educator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
}, {
    timestamps: true
});

// Create compound index for unique course per branch and semester
courseSchema.index({ code: 1, branch: 1, semester: 1, batchYear: 1 }, { unique: true });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course; 