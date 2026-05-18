const mongoose = require('mongoose');

const courseOutcomeSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    code: {
        type: String,
        required: true // e.g., "CO1", "CO2"
    },
    description: {
        type: String,
        required: true
    },
    bloomsLevel: {
        type: String,
        enum: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create']
    },
    // Program Outcome Mapping
    programOutcomes: [{
        code: String, // e.g., "PO1", "PO2"
        correlation: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium'
        }
    }],
    // Assessment Methods
    assessmentMethods: [{
        type: String,
        enum: ['Assignment', 'Quiz', 'Lab', 'Project', 'Exam', 'Presentation']
    }],
    weightage: {
        type: Number,
        min: 0,
        max: 100
    },
    createdAt: { type: Date, default: Date.now }
});

courseOutcomeSchema.index({ course: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('CourseOutcome', courseOutcomeSchema);
