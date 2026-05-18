const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Academic Context
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    semester: Number,
    subject: String,
    topic: String,
    // Session Mode
    mode: {
        type: String,
        enum: [
            'ExplainConcept',
            'SolveDoubt',
            'PrepareExam',
            'GenerateNotes',
            'PracticeQuestions',
            'ReviseQuickly',
            'SocraticMode',
            'General'
        ],
        default: 'General'
    },
    // Student Level
    detectedLevel: {
        type: String,
        enum: ['Weak', 'Average', 'Advanced'],
        default: 'Average'
    },
    // Conversation
    messages: [{
        role: {
            type: String,
            enum: ['user', 'assistant', 'system']
        },
        content: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        metadata: {
            questionAsked: Boolean,
            conceptExplained: String,
            codeProvided: Boolean,
            quizGenerated: Boolean
        }
    }],
    // Learning Tracking
    conceptsCovered: [String],
    weakTopics: [String],
    strongTopics: [String],
    questionsAsked: Number,
    correctAnswers: Number,
    incorrectAnswers: Number,
    // Adaptive Learning
    difficultyProgression: [{
        timestamp: Date,
        level: String
    }],
    // Session Stats
    duration: Number, // in minutes
    messageCount: Number,
    satisfactionRating: Number,
    isActive: {
        type: Boolean,
        default: true
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    endedAt: Date,
    createdAt: { type: Date, default: Date.now }
});

chatSessionSchema.index({ student: 1, isActive: 1 });
chatSessionSchema.index({ course: 1, topic: 1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
