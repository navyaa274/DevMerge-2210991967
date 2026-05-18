const mongoose = require('mongoose');

const questionBankSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  subject: {
    type: String,
    trim: true
  },
  topic: {
    type: String,
    trim: true
  },
  difficulty_level: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Expert'],
    default: 'Medium'
  },
  question_count: {
    type: Number,
    default: 0
  },
  total_questions: {
    type: Number,
    default: 0
  },
  is_active: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  access_level: {
    type: String,
    enum: ['private', 'course', 'department', 'public'],
    default: 'course'
  },
  usage_count: {
    type: Number,
    default: 0
  },
  average_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
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
questionBankSchema.index({ course_id: 1, is_active: 1 });
questionBankSchema.index({ subject: 1, topic: 1 });
questionBankSchema.index({ difficulty_level: 1 });
questionBankSchema.index({ created_by: 1 });
questionBankSchema.index({ access_level: 1 });

// Update the updated_at field before saving
questionBankSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('QuestionBank', questionBankSchema);
