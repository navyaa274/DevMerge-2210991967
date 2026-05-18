const mongoose = require('mongoose');

/**
 * Streak Model
 * Tracks daily user engagement to boost retention and gamify learning.
 */
const streakSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date
  },
  activityLog: [{
    date: { type: Date, required: true },
    pointsEarned: { type: Number, default: 0 },
    activityType: String // 'problem', 'lab', 'quiz', 'course'
  }],
  multiplier: {
    type: Number,
    default: 1.0
  }
}, { timestamps: true });

// Method to update streak
streakSchema.methods.recordActivity = function (points) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!this.lastActivityDate) {
    this.currentStreak = 1;
  } else {
    const lastDate = new Date(this.lastActivityDate);
    lastDate.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day
      this.currentStreak += 1;
    } else if (diffDays > 1) {
      // Streak broken
      this.currentStreak = 1;
    }
    // if diffDays === 0, streak stays same (already active today)
  }

  this.lastActivityDate = new Date();
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }

  // Activity log
  this.activityLog.push({
    date: new Date(),
    pointsEarned: points,
    activityType: 'learning'
  });

  // Limit log size
  if (this.activityLog.length > 30) {
    this.activityLog.shift();
  }
};

module.exports = mongoose.model('Streak', streakSchema);
