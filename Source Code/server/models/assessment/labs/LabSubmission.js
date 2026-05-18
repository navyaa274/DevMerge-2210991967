const mongoose = require('mongoose');

const labSubmissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  lab: { type: mongoose.Schema.Types.ObjectId, ref: 'LabManual', required: true, index: true },
  submissionData: {
    code: String,
    labReport: String,
    files: [String],
    results: mongoose.Schema.Types.Mixed
  },
  grade: { type: Number, default: null },
  feedback: { type: String, default: null },
  rubricScores: { type: mongoose.Schema.Types.Mixed, default: {} },
  coAttainment: { type: mongoose.Schema.Types.Mixed, default: {} },
  poAttainment: { type: mongoose.Schema.Types.Mixed, default: {} },
  bonusPoints: { type: Number, default: 0 },
  status: { type: String, enum: ['submitted', 'graded', 'reviewed'], default: 'submitted' },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gradedAt: Date,
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('LabSubmission', labSubmissionSchema);
