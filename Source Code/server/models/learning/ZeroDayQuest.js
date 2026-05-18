const mongoose = require('mongoose');

const ZeroDayQuestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard', 'Expert'],
        default: 'Medium'
    },
    baseXp: {
        type: Number,
        required: true,
        default: 100
    },
    multiplier: {
        type: Number,
        required: true,
        default: 1.0
    },
    timeLimitMinutes: {
        type: Number,
        required: true,
        default: 60
    },
    colorTheme: {
        type: String,
        default: 'amber'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    expiresAt: {
        type: Date,
        required: true
    },
    participants: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        completed: {
            type: Boolean,
            default: false
        },
        completedAt: Date,
        xpEarned: Number
    }],
    status: {
        type: String,
        enum: ['Active', 'Expired', 'Cancelled'],
        default: 'Active'
    }
}, {
    timestamps: true
});

// Middleware to set status based on time
ZeroDayQuestSchema.pre('find', function () {
    const now = new Date();
    // This is a bit complex for a pre-find middleware in a generic way, 
    // but we can add a helper method or handle in controller.
});

module.exports = mongoose.model('ZeroDayQuest', ZeroDayQuestSchema);
