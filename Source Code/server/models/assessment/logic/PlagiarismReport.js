const mongoose = require('mongoose');

const plagiarismReportSchema = new mongoose.Schema({
  submission1: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
  submission2: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
  assignment1: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }, // For written assignments
  assignment2: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
  type: { type: String, enum: ['code', 'written'], default: 'code' },
  similarityScore: { type: Number, required: true }, // 0-100
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true
  },
  matchedLines: [{
    line1: Number,
    line2: Number,
    code: String
  }],
  flagged: { type: Boolean, default: false },
  reviewed: { type: Boolean, default: false },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNotes: String,
  metadata: {
    aiAnalysis: String,
    structuralConfidence: Number
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PlagiarismReport', plagiarismReportSchema);
