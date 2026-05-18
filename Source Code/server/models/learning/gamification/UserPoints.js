const mongoose = require('mongoose');

const userPointsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  pointsBreakdown: {
    problemsSolved: { type: Number, default: 0 },
    contestsWon: { type: Number, default: 0 },
    helpfulReviews: { type: Number, default: 0 },
    mentorshipPoints: { type: Number, default: 0 },
    achievementPoints: { type: Number, default: 0 }
  },
  level: {
    type: Number,
    default: 1
  },
  experiencePoints: {
    type: Number,
    default: 0
  },
  rank: String,
  tier: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster'],
    default: 'Bronze'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Calculate Level and Tier based on XP
userPointsSchema.methods.updateLevel = function () {
  // Leveling curve: Level 1-100
  // Each level requires more XP: XP = 500 * (level^1.5)
  const currentXP = this.experiencePoints;
  const newLevel = Math.floor(Math.pow(currentXP / 500, 1 / 1.5)) + 1;

  if (newLevel !== this.level) {
    this.level = newLevel;

    // Update Tier
    if (this.level >= 80) this.tier = 'Grandmaster';
    else if (this.level >= 65) this.tier = 'Master';
    else if (this.level >= 50) this.tier = 'Diamond';
    else if (this.level >= 35) this.tier = 'Platinum';
    else if (this.level >= 20) this.tier = 'Gold';
    else if (this.level >= 10) this.tier = 'Silver';
    else this.tier = 'Bronze';

    return true; // Level up!
  }
  return false;
};

module.exports = mongoose.model('UserPoints', userPointsSchema);
