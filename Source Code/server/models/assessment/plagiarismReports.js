const mongoose = require('mongoose');

const plagiarismReportSchema = new mongoose.Schema({
  submission_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problem_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  plagiarism_score: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  confidence_level: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'flagged', 'cleared'],
    default: 'pending'
  },
  detection_method: {
    type: String,
    enum: ['moss', 'copyleaks', 'internal', 'manual'],
    required: true
  },
  report_url: {
    type: String,
    trim: true
  },
  report_data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  matches_found: {
    type: Number,
    default: 0
  },
  top_match_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  flagged_by_system: {
    type: Boolean,
    default: false
  },
  reviewed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewed_at: Date,
  review_notes: {
    type: String,
    trim: true
  },
  action_taken: {
    type: String,
    enum: ['none', 'warning', 'grade_penalty', 'zero_grade', 'academic_integrity_violation'],
    default: 'none'
  },
  notified_user: {
    type: Boolean,
    default: false
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
plagiarismReportSchema.index({ submission_id: 1 }, { unique: true });
plagiarismReportSchema.index({ user_id: 1, created_at: -1 });
plagiarismReportSchema.index({ problem_id: 1 });
plagiarismReportSchema.index({ course_id: 1 });
plagiarismReportSchema.index({ status: 1 });
plagiarismReportSchema.index({ plagiarism_score: -1 });
plagiarismReportSchema.index({ detection_method: 1 });

// Update the updated_at field before saving
plagiarismReportSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.models.PlagiarismReport || mongoose.model('PlagiarismReport', plagiarismReportSchema);
