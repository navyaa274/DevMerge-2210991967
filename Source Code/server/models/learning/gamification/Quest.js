const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    issuer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: false,
        default: null
    },
    targetSections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section'
    }],
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard', 'Expert'],
        default: 'Medium'
    },
    baseXp: {
        type: Number,
        required: true,
        min: 10
    },
    timeLimitMinutes: {
        type: Number,
        required: true,
        min: 5
    },
    multiplier: {
        type: Number,
        default: 1.0
    },
    tags: [{
        type: String,
        trim: true
    }],
    colorTheme: {
        type: String,
        enum: ['rose', 'amber', 'emerald', 'indigo', 'violet', 'fuchsia'],
        default: 'indigo'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    acceptedBy: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        acceptedAt: {
            type: Date,
            default: Date.now
        },
        completedAt: Date,
        status: {
            type: String,
            enum: ['In Progress', 'Completed', 'Failed', 'Expired'],
            default: 'In Progress'
        },
        earnedXp: Number
    }]
}, {
    timestamps: true
});

// Auto-expire quests
questSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Quest = mongoose.model('Quest', questSchema);

module.exports = Quest;

