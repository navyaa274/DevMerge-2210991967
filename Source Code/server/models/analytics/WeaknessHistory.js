const mongoose = require('mongoose');

const weaknessHistorySchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        index: true
    },
    topic: {
        type: String,
        required: true,
        index: true
    },
    score: {
        type: Number,
        required: true
    },
    severity: {
        type: String,
        enum: ['Critical', 'High', 'Medium', 'Low'],
        default: 'Medium'
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.model('WeaknessHistory', weaknessHistorySchema);
