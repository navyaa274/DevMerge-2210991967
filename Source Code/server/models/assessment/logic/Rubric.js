const mongoose = require('mongoose');

const rubricSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        index: true
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    assignmentId: {
        type: String, // Can be from the AI generated assignment or local Assignment model
        required: true,
        index: true
    },
    questions: [{
        questionText: String,
        totalMarks: Number,
        bloomLevel: String,
        coMapping: [String],
        criteria: [{
            criterion: String,
            description: String,
            marks: Number
        }]
    }],
    governanceMetaData: {
        aiGenerated: { type: Boolean, default: true },
        strictnessLevel: { type: String, default: 'standard' }
    }
}, { timestamps: true });

rubricSchema.index({ assignmentId: 1 });

module.exports = mongoose.model('Rubric', rubricSchema);
