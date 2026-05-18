const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  assignment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  attempt_number: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'timed_out', 'abandoned'],
    default: 'in_progress'
  },
  start_time: {
    type: Date,
    default: Date.now
  },
  end_time: Date,
  time_spent_seconds: {
    type: Number,
    default: 0
  },
  total_questions: {
    type: Number,
    default: 0
  },
  answered_questions: {
    type: Number,
    default: 0
  },
  correct_answers: {
    type: Number,
    default: 0
  },
  incorrect_answers: {
    type: Number,
    default: 0
  },
  skipped_questions: {
    type: Number,
    default: 0
  },
  score_percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  total_score: {
    type: Number,
    default: 0
  },
  max_score: {
    type: Number,
    default: 0
  },
  passing_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 60
  },
  is_passed: {
    type: Boolean,
    default: false
  },
  grade: {
    type: String,
    trim: true
  },
  feedback: {
    type: String,
    trim: true
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ip_address: {
    type: String,
    trim: true
  },
  user_agent: {
    type: String,
    trim: true
  },
  is_proctored: {
    type: Boolean,
    default: false
  },
  proctoring_data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes
quizAttemptSchema.index({ user_id: 1, quiz_id: 1, attempt_number: 1 });
quizAttemptSchema.index({ user_id: 1, assignment_id: 1, attempt_number: 1 });
quizAttemptSchema.index({ course_id: 1, user_id: 1 });
quizAttemptSchema.index({ status: 1 });
quizAttemptSchema.index({ start_time: -1 });

// Update the updated_at field before saving
quizAttemptSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
