const mongoose = require('mongoose');

const studentLearningStateSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        index: true
    },
    unlockedModules: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Syllabus'
    }],
    lockedModules: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Syllabus'
    }],
    remedialModules: [{
        topic: String,
        reason: String,
        addedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
    }],
    adaptationMode: {
        type: String,
        enum: ['normal', 'remedial', 'accelerated'],
        default: 'normal'
    },
    lastAdjustmentAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

studentLearningStateSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('StudentLearningState', studentLearningStateSchema);
