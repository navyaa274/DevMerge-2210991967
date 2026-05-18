const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  learningPath: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningPath' },
  module: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timeLimit: { type: Number, default: 30 }, // minutes
  passingScore: { type: Number, default: 70 }, // percentage
  questions: [{
    question: { type: String, required: true },
    type: { type: String, enum: ['multiple-choice', 'true-false', 'short-answer'], default: 'multiple-choice' },
    options: [String],
    correctAnswer: { type: String, required: true },
    explanation: String,
    points: { type: Number, default: 1 }
  }],
  attempts: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    answers: [String],
    score: Number,
    percentage: Number,
    passed: Boolean,
    completedAt: Date
  }],
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
