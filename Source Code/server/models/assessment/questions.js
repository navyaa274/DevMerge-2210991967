const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question_bank_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuestionBank',
    required: true
  },
  question_text: {
    type: String,
    required: true,
    trim: true
  },
  question_type: {
    type: String,
    enum: ['multiple_choice', 'true_false', 'short_answer', 'essay', 'code', 'matching', 'ordering'],
    required: true
  },
  difficulty_level: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Expert'],
    default: 'Medium'
  },
  points: {
    type: Number,
    default: 1,
    min: 0
  },
  time_limit_seconds: {
    type: Number,
    default: 0
  },
  explanation: {
    type: String,
    trim: true
  },
  hint: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  is_active: {
    type: Boolean,
    default: true
  },
  usage_count: {
    type: Number,
    default: 0
  },
  correct_rate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  average_time_seconds: {
    type: Number,
    default: 0
  },
  cognitive_level: {
    type: String,
    enum: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'],
    default: 'Understand'
  },
  subject: {
    type: String,
    trim: true
  },
  topic: {
    type: String,
    trim: true
  },
  subtopic: {
    type: String,
    trim: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
questionSchema.index({ question_bank_id: 1, is_active: 1 });
questionSchema.index({ question_type: 1 });
questionSchema.index({ difficulty_level: 1 });
questionSchema.index({ cognitive_level: 1 });
questionSchema.index({ subject: 1, topic: 1 });
questionSchema.index({ created_by: 1 });

// Update the updated_at field before saving
questionSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Question', questionSchema);
