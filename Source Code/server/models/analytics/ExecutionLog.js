const mongoose = require('mongoose');

const executionLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: false
    },
    language: {
        type: String,
        required: true,
        enum: ['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust', 'ruby', 'swift', 'csharp', 'php', 'bash']
    },
    status: {
        type: String,
        enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error', 'System Error'],
        required: true
    },
    runtime: {
        type: Number, // execution time in ms
        default: 0
    },
    memory: {
        type: Number, // memory used in MB
        default: 0
    },
    testsPassed: {
        type: Number,
        default: 0
    },
    testsTotal: {
        type: Number,
        default: 0
    },
    engineUsed: {
        type: String, // 'docker', 'judge0', 'piston'
        default: 'docker'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 30 * 24 * 60 * 60 // Auto delete logs older than 30 days
    }
});

// Index for quick analytics queries
executionLogSchema.index({ language: 1, status: 1 });
executionLogSchema.index({ createdAt: -1 });
executionLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ExecutionLog', executionLogSchema);
