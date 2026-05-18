const mongoose = require('mongoose');

const studentWeaknessSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    studentId: {
        type: String
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    // Weakness Analysis
    weakTopics: [{
        topic: String,
        subject: String,
        severity: {
            type: String,
            enum: ['Critical', 'High', 'Medium', 'Low'],
            default: 'Medium'
        },
        attempts: Number,
        successRate: Number,
        lastAttempt: Date,
        improvementTrend: {
            type: String,
            enum: ['Improving', 'Stable', 'Declining', 'Critical'],
            default: 'Stable'
        }
    }],
    // Mastery Scores
    masteryScores: [{
        topic: String,
        score: {
            type: Number,
            min: 0,
            max: 100
        },
        bloomsLevel: String,
        lastUpdated: Date
    }],
    // Mistake Patterns
    commonMistakes: [{
        pattern: String,
        frequency: Number,
        relatedTopics: [String],
        suggestion: String
    }],
    // Learning Style
    preferredLearningStyle: {
        type: String,
        enum: ['Visual', 'Auditory', 'Reading', 'Kinesthetic', 'Mixed']
    },
    // Recommendations
    recommendedActions: [{
        action: String,
        priority: {
            type: String,
            enum: ['High', 'Medium', 'Low']
        },
        topic: String,
        estimatedTime: Number, // in minutes
        completed: {
            type: Boolean,
            default: false
        }
    }],
    // Progress Tracking
    overallProgress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    lastAnalyzed: {
        type: Date,
        default: Date.now
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { strict: false });

studentWeaknessSchema.index({ student: 1, course: 1 });
studentWeaknessSchema.pre('validate', function (next) {
    if (!this.student && this.studentId && mongoose.Types.ObjectId.isValid(this.studentId)) {
        this.student = this.studentId;
    }
    next();
});

studentWeaknessSchema.index({ 'weakTopics.severity': 1 });

module.exports = mongoose.model('StudentWeakness', studentWeaknessSchema);



