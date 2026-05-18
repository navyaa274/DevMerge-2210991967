const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    semesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
    status: {
        type: String,
        enum: ['active', 'completed', 'dropped'],
        default: 'active'
    },
    enrolledAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// One enrollment per student per semester
enrollmentSchema.index({ studentId: 1, semesterId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
