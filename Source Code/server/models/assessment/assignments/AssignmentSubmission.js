const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true,
        index: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    content: {
        type: String, // Could be text response or URL to a file
        required: true
    },
    submissionType: {
        type: String,
        enum: ['text', 'file', 'link'],
        default: 'text'
    },
    grade: {
        type: Number,
        default: null
    },
    feedback: {
        type: String,
        default: null
    },
    aiFeedback: {
        type: mongoose.Schema.Types.Mixed, // Stores the structured JSON from the feedback engine
        default: null
    },
    gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    gradedAt: Date,
    status: {
        type: String,
        enum: ['submitted', 'graded', 'reviewed'],
        default: 'submitted'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

assignmentSubmissionSchema.index({ assignment: 1, student: 1 });

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
