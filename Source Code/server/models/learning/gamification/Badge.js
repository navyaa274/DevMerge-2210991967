const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  icon: String,
  category: {
    type: String,
    enum: ['achievement', 'streak', 'milestone', 'skill', 'challenge'],
    default: 'achievement'
  },
  criteria: {
    type: {
      type: String,
      enum: ['problems_solved', 'streak_days', 'exam_score', 'contest_rank', 'skill_level'],
      required: true
    },
    value: Number,
    threshold: Number
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  points: {
    type: Number,
    default: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Badge', badgeSchema);
