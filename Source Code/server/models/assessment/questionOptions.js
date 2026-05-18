const mongoose = require('mongoose');

const questionOptionSchema = new mongoose.Schema({
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  option_text: {
    type: String,
    required: true,
    trim: true
  },
  option_letter: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E', 'F'],
    required: true
  },
  is_correct: {
    type: Boolean,
    default: false
  },
  order_index: {
    type: Number,
    default: 0
  },
  explanation: {
    type: String,
    trim: true
  },
  metadata: {
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
questionOptionSchema.index({ question_id: 1, order_index: 1 });
questionOptionSchema.index({ question_id: 1, is_correct: 1 });

// Update the updated_at field before saving
questionOptionSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('QuestionOption', questionOptionSchema);
