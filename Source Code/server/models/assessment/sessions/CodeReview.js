const mongoose = require('mongoose');

const codeReviewSchema = new mongoose.Schema({
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: true
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [{
    lineNumber: Number,
    code: String,
    comment: String,
    severity: {
      type: String,
      enum: ['info', 'warning', 'error'],
      default: 'info'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  overallRating: {
    type: Number,
    min: 1,
    max: 5
  },
  codeQualityScore: Number,
  readabilityScore: Number,
  efficiencyScore: Number,
  suggestions: [String],
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

module.exports = mongoose.model('CodeReview', codeReviewSchema);
