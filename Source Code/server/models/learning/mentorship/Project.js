const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    facultyManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['Proposed', 'Active', 'Under Review', 'Completed', 'Archived'],
        default: 'Proposed'
    },
    milestones: [{
        title: String,
        description: String,
        dueDate: Date,
        status: {
            type: String,
            enum: ['Pending', 'Submitted', 'Approved', 'Rejected'],
            default: 'Pending'
        },
        submissionUrl: String,
        feedback: String,
        grade: Number
    }],
    artifacts: [{
        name: String,
        url: String,
        fileType: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    repositoryUrl: String,
    finalGrade: { type: Number, min: 0, max: 100 },
    isTeamProject: { type: Boolean, default: false },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

projectSchema.index({ student: 1, course: 1 });
projectSchema.index({ facultyManager: 1 });

module.exports = mongoose.model('Project', projectSchema);
