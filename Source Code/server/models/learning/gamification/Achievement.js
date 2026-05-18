const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['first_submission', 'perfect_score', 'streak_milestone', 'problem_master', 'contest_winner', 'helper', 'reviewer'],
    required: true
  },
  title: String,
  description: String,
  icon: String,
  points: {
    type: Number,
    default: 0
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  metadata: mongoose.Schema.Types.Mixed
});

achievementSchema.index({ userId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', achievementSchema);
