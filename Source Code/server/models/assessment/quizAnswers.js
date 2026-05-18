const mongoose = require('mongoose');

const quizAnswerSchema = new mongoose.Schema({
  quiz_attempt_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizAttempt',
    required: true
  },
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answer_text: {
    type: String,
    trim: true
  },
  selected_options: [{
    option_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuestionOption'
    },
    option_letter: String,
    is_selected: {
      type: Boolean,
      default: true
    }
  }],
  is_correct: {
    type: Boolean,
    default: false
  },
  points_earned: {
    type: Number,
    default: 0,
    min: 0
  },
  max_points: {
    type: Number,
    default: 0,
    min: 0
  },
  time_spent_seconds: {
    type: Number,
    default: 0,
    min: 0
  },
  attempt_number: {
    type: Number,
    default: 1,
    min: 1
  },
  feedback: {
    type: String,
    trim: true
  },
  is_flagged: {
    type: Boolean,
    default: false
  },
  flagged_reason: {
    type: String,
    trim: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  answered_at: {
    type: Date,
    default: Date.now
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
quizAnswerSchema.index({ quiz_attempt_id: 1, question_id: 1 }, { unique: true });
quizAnswerSchema.index({ user_id: 1, answered_at: -1 });
quizAnswerSchema.index({ question_id: 1 });
quizAnswerSchema.index({ is_correct: 1 });

// Update the updated_at field before saving
quizAnswerSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('QuizAnswer', quizAnswerSchema);
