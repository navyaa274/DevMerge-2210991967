const mongoose = require('mongoose');

const courseMaterialSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['pdf', 'ppt', 'link', 'notes'],
        required: true
    },
    url: {
        type: String,
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for fast retrieval per course
courseMaterialSchema.index({ courseId: 1 });

module.exports = mongoose.model('CourseMaterial', courseMaterialSchema);
