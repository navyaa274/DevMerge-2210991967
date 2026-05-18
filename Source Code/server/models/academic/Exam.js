const mongoose = require('mongoose');

/**
 * Exam Model
 * Represents exams created by faculty for courses
 */

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 5000,
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 30,
    max: 300
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 0
  },
  examType: {
    type: String,
    enum: ['midterm', 'final', 'quiz', 'practical'],
    required: true
  },
  instructions: {
    type: String,
    maxlength: 5000
  },
  questions: [{
    question: String,
    options: [String], // for MCQ
    correctAnswer: String,
    marks: Number,
    type: {
      type: String,
      enum: ['mcq', 'short_answer', 'long_answer']
    }
  }],
  results: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answers: [{
      questionIndex: Number,
      answer: String
    }],
    marks: Number,
    grade: String,
    feedback: String,
    submittedAt: Date,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    gradedAt: Date
  }],
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  room: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
examSchema.index({ course: 1, examDate: 1 });
examSchema.index({ faculty: 1 });

// Update updatedAt on save
examSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.models.Exam || mongoose.model('Exam', examSchema);
