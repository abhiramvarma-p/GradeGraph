import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }]
}, {
    timestamps: true
});

const Branch = mongoose.model('Branch', branchSchema);

export default Branch; 