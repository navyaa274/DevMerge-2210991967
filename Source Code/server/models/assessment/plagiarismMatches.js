const mongoose = require('mongoose');

const plagiarismMatchSchema = new mongoose.Schema({
  plagiarism_report_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlagiarismReport',
    required: true
  },
  submission_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: true
  },
  matched_submission_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matched_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  similarity_score: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  match_type: {
    type: String,
    enum: ['exact', 'near_exact', 'structural', 'semantic', 'partial'],
    default: 'partial'
  },
  matched_lines: [{
    original_line: Number,
    matched_line: Number,
    length: Number,
    code_snippet: String
  }],
  matched_percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  detection_method: {
    type: String,
    enum: ['moss', 'copyleaks', 'internal', 'manual'],
    required: true
  },
  match_details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  is_significant: {
    type: Boolean,
    default: false
  },
  reviewed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewed_at: Date,
  review_status: {
    type: String,
    enum: ['unreviewed', 'confirmed', 'dismissed', 'investigating'],
    default: 'unreviewed'
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
plagiarismMatchSchema.index({ plagiarism_report_id: 1 });
plagiarismMatchSchema.index({ submission_id: 1, matched_submission_id: 1 });
plagiarismMatchSchema.index({ user_id: 1 });
plagiarismMatchSchema.index({ matched_user_id: 1 });
plagiarismMatchSchema.index({ similarity_score: -1 });
plagiarismMatchSchema.index({ review_status: 1 });
plagiarismMatchSchema.index({ is_significant: 1 });

// Compound index to prevent duplicate matches
plagiarismMatchSchema.index({
  submission_id: 1,
  matched_submission_id: 1,
  plagiarism_report_id: 1
}, { unique: true });

// Update the updated_at field before saving
plagiarismMatchSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('PlagiarismMatch', plagiarismMatchSchema);
