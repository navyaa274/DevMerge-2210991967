const mongoose = require('mongoose');

const labManualSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    labNumber: {
        type: Number,
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    semester: {
        type: Number,
        min: 1,
        max: 8
    },
    // Lab Structure
    aim: {
        type: String,
        required: true
    },
    learningOutcomes: [String],
    courseOutcomes: [{
        code: String, // CO1, CO2, etc.
        description: String
    }],
    programOutcomes: [{
        code: String, // PO1, PO2, etc.
        correlation: {
            type: String,
            enum: ['Low', 'Medium', 'High']
        }
    }],
    theory: {
        type: String,
        required: true
    },
    algorithm: String,
    // Multi-language Code Support
    code: {
        javascript: String,
        python: String,
        cpp: String,
        java: String,
        c: String
    },
    sampleOutput: String,
    // Viva Questions
    vivaQuestions: [{
        question: String,
        difficulty: {
            type: String,
            enum: ['Basic', 'Intermediate', 'Advanced']
        },
        answer: String
    }],
    // Common Mistakes
    commonMistakes: [{
        mistake: String,
        explanation: String,
        solution: String
    }],
    // Industrial Application
    industrialApplication: String,
    realWorldUseCase: String,
    // Grading Rubric
    gradingRubric: {
        implementation: { type: Number, default: 40 },
        understanding: { type: Number, default: 20 },
        viva: { type: Number, default: 20 },
        recordWork: { type: Number, default: 10 },
        innovation: { type: Number, default: 10 }
    },
    // Flow Explanation
    flowExplanation: String,
    flowDiagram: String, // URL or base64
    // Lab Type
    labType: {
        type: String,
        enum: ['Simulation', 'Programming', 'Hardware', 'Research'],
        default: 'Programming'
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    estimatedTime: Number, // in minutes
    prerequisites: [String],
    references: [String],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isAiGenerated: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['Draft', 'Published'],
        default: 'Draft'
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    dueDate: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

labManualSchema.index({ course: 1, labNumber: 1 });
labManualSchema.index({ semester: 1, difficulty: 1 });

module.exports = mongoose.model('LabManual', labManualSchema);
