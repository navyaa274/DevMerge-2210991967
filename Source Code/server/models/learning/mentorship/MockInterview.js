const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true // e.g., "MERN Stack Developer  Interview"
    },
    status: {
        type: String,
        enum: ['Scheduled', 'In-Progress', 'Completed', 'Evaluating', 'Failing'],
        default: 'In-Progress'
    },
    transcript: [{
        role: { type: String, enum: ['agent', 'student'] },
        content: String,
        timestamp: { type: Date, default: Date.now },
        metadata: {
            emotion: String,
            confidence: Number
        }
    }],
    evaluation: {
        score: { type: Number, min: 0, max: 100 },
        summary: String,
        strengths: [String],
        weaknesses: [String],
        nextSteps: [String],
        rubricScores: {
            technicalSkills: Number,
            communication: Number,
            problemSolving: Number,
            projectRelevance: Number
        }
    },
    portfolioSnapshot: {
        skills: [String],
        projectsCount: Number,
        topCertifications: [String]
    },
    durationSeconds: Number,
    startedAt: { type: Date, default: Date.now },
    endedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Interview', InterviewSchema);
