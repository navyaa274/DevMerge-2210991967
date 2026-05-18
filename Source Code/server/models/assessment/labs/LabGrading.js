const mongoose = require('mongoose');

const labGradingSchema = new mongoose.Schema({
  submission: { type: mongoose.Schema.Types.ObjectId, ref: 'LabSubmission', required: true },
  evaluator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Multi-dimensional Component Scoring
  componentScores: {
    implementation: { score: { type: Number, default: 0 }, maxScore: { type: Number, default: 40 } },
    understanding: { score: { type: Number, default: 0 }, maxScore: { type: Number, default: 20 } },
    viva: { score: { type: Number, default: 0 }, maxScore: { type: Number, default: 20 } },
    recordWork: { score: { type: Number, default: 0 }, maxScore: { type: Number, default: 10 } },
    innovation: { score: { type: Number, default: 0 }, maxScore: { type: Number, default: 10 } }
  },

  rubricScores: [{
    criterion: String,
    score: Number,
    maxScore: Number,
    feedback: String
  }],

  // AI-Assisted Insights
  codeReview: {
    complexityScore: Number,
    optimizationPotential: String,
    styleGuideCompliance: Boolean
  },

  // Peer Review / Moderation Logic
  moderator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isModerated: { type: Boolean, default: false },
  moderationComments: String,
  moderationDate: Date,
  moderationAdjustments: { type: Number, default: 0 }, // Variance from original score

  totalScore: { type: Number, default: 0 },
  maxScore: { type: Number, default: 100 },
  grade: { type: String },

  feedback: {
    strengths: [String],
    weaknesses: [String],
    improvements: [String],
    detailed: String
  },

  status: {
    type: String,
    enum: ['Draft', 'Completed', 'Moderated', 'Flagged'],
    default: 'Completed'
  },

  isActive: { type: Boolean, default: true },
  evaluationEndTime: Date
}, { timestamps: true });

// Auto-calculate totals and grades
labGradingSchema.methods.calculateTotalScore = function () {
  const scores = this.componentScores;
  this.totalScore = (scores.implementation.score || 0) +
    (scores.understanding.score || 0) +
    (scores.viva.score || 0) +
    (scores.recordWork.score || 0) +
    (scores.innovation.score || 0);

  const percentage = (this.totalScore / this.maxScore) * 100;

  if (percentage >= 90) this.grade = 'A+';
  else if (percentage >= 80) this.grade = 'A';
  else if (percentage >= 70) this.grade = 'B+';
  else if (percentage >= 60) this.grade = 'B';
  else if (percentage >= 50) this.grade = 'C';
  else this.grade = 'F';

  return this.totalScore;
};

module.exports = mongoose.model('LabGrading', labGradingSchema);
