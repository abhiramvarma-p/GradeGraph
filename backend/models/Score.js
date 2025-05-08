const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    educator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    subject: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    comments: {
        type: String
    },
    batchYear: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Create compound index for student and course
scoreSchema.index({ student: 1, course: 1, semester: 1 }, { unique: true });

const Score = mongoose.model('Score', scoreSchema);

module.exports = Score; 