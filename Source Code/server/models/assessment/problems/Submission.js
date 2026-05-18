const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contest: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', default: null },
  isContestSubmission: { type: Boolean, default: false },
  code: { type: String, required: true },
  language: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "wrong_answer", "runtime_error", "time_limit"],
    default: "pending",
    required: true
  },
  isPublic: { type: Boolean, default: false }, // Phase 6 Item 26
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  runtime: Number, // ms
  memory: Number, // MB
  testsPassed: Number,
  totalTests: Number,
  similarityScore: { type: Number, default: 0 },
  plagiarismFlag: { type: Boolean, default: false },
  output: String,
  error: String,
  grade: { type: Number, default: null },
  feedback: { type: String, default: null },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gradedAt: Date,
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);
