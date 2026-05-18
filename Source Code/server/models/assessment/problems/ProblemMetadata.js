const mongoose = require('mongoose');

const problemMetadataSchema = new mongoose.Schema({
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    // Bloom's Taxonomy Level
    bloomsLevel: {
        type: String,
        enum: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'],
        required: true
    },
    // Question Type
    questionType: {
        type: String,
        enum: ['Coding', 'MCQ', 'Theory', 'CaseStudy', 'Debugging', 'Optimization', 'SystemDesign'],
        required: true
    },
    // Academic Context
    course: {
        type: String,
        enum: ['BTech_CSE', 'BCA', 'MCA', 'BTech_IT', 'Management', 'Law', 'Other'],
        required: true
    },
    semester: {
        type: Number,
        min: 1,
        max: 8,
        required: true
    },
    subject: String,
    unit: String,
    // Complexity Analysis
    expectedTimeComplexity: String, // e.g., "O(n log n)"
    expectedSpaceComplexity: String, // e.g., "O(n)"
    actualDifficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard', 'Expert'],
        required: true
    },
    // Real-World Context
    realWorldContext: String,
    industryApplication: String,
    // Problem Mode
    problemMode: {
        type: String,
        enum: ['Assignment', 'Exam', 'Practice', 'Competitive'],
        default: 'Practice'
    },
    // Evaluation Criteria
    evaluationCriteria: {
        correctness: { type: Number, default: 40 },
        efficiency: { type: Number, default: 20 },
        codeQuality: { type: Number, default: 20 },
        edgeCaseHandling: { type: Number, default: 20 }
    },
    // Learning Outcomes
    learningOutcomes: [String],
    prerequisites: [String],
    relatedConcepts: [String],
    // Statistics
    averageAttempts: { type: Number, default: 0 },
    averageTimeToSolve: { type: Number, default: 0 }, // in minutes
    successRate: { type: Number, default: 0 },
    // Tags
    tags: [String],
    keywords: [String],
    // Anti-Cheating
    hasRandomization: { type: Boolean, default: false },
    parameterRanges: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

problemMetadataSchema.index({ problem: 1 });
problemMetadataSchema.index({ bloomsLevel: 1, semester: 1 });
problemMetadataSchema.index({ course: 1, subject: 1 });

module.exports = mongoose.model('ProblemMetadata', problemMetadataSchema);
