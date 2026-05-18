const mongoose = require('mongoose');

/**
 * Viva Session Model
 * Tracks an AI-driven oral examination for a student on a specific topic.
 */
const vivaSessionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    labManual: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabManual'
    },
    questions: [{
        question: { type: String, required: true },
        expectedAnswer: String,
        difficulty: {
            type: String,
            enum: ['Basic', 'Intermediate', 'Advanced'],
            default: 'Basic'
        },
        studentAnswer: String,
        aiScore: { type: Number, min: 0, max: 10 },
        aiFeedback: String,
        answeredAt: Date
    }],
    overallScore: {
        type: Number,
        min: 0,
        max: 100
    },
    overallFeedback: String,
    status: {
        type: String,
        enum: ['Scheduled', 'InProgress', 'Completed', 'Cancelled'],
        default: 'Scheduled'
    },
    startedAt: Date,
    completedAt: Date
}, { timestamps: true });

// Index for quick status checks
vivaSessionSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model('VivaSession', vivaSessionSchema);
