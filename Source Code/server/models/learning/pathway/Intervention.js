const mongoose = require('mongoose');

const interventionSchema = new mongoose.Schema({
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
        required: true
    },
    triggerTrend: {
        type: String,
        enum: ['Declining', 'Critical'],
        required: true
    },
    recommendationType: {
        type: String,
        enum: ['extra_practice', 'faculty_review', 'peer_support', 'conceptual_remediation'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    severityLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Acknowledged', 'Resolved'],
        default: 'Pending',
        index: true
    },
    facultyNotes: String,
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { timestamps: true });

// Prevent duplicate active interventions for the same student/topic/course combo within a short window
interventionSchema.index({ studentId: 1, courseId: 1, topic: 1, status: 1 });

module.exports = mongoose.model('Intervention', interventionSchema);
