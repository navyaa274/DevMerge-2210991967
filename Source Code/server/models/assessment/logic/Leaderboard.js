const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['course', 'department', 'global', 'contest'],
    required: true
  },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  contest: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' },
  entries: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rank: Number,
    score: Number,
    problemsSolved: Number,
    totalAttempts: Number,
    lastSubmission: Date
  }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
