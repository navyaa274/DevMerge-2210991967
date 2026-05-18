const mongoose = require('mongoose');

const copilotUsageLogSchema = new mongoose.Schema({
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        index: true
    },
    actionType: {
        type: String,
        enum: [
            'assignment_gen',
            'rubric_gen',
            'feedback_gen',
            'code_review',
            'lecture_notes_gen',
            'insight_analysis',
            'problem_gen',
            'lab_gen'
        ],
        required: true,
        index: true
    },
    promptSize: Number, // in characters/tokens approx
    generationSize: Number,
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed // For storing question counts, mark distribution etc.
    }
}, { timestamps: true });

module.exports = mongoose.model('CopilotUsageLog', copilotUsageLogSchema);
