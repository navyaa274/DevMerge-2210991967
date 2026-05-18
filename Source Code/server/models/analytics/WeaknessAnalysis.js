const mongoose = require('mongoose');

const weaknessAnalysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  analysis: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WeaknessAnalysis', weaknessAnalysisSchema);
