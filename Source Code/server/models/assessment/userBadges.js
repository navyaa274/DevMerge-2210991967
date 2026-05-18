const mongoose = require('mongoose');

const userBadgeSchema = new mongoose.Schema({
  badge_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  },
  awarded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  award_date: {
    type: Date,
    default: Date.now
  },
  reason: {
    type: String,
    trim: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  is_displayed: {
    type: Boolean,
    default: true
  },
  earned_points: {
    type: Number,
    min: 0,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes
userBadgeSchema.index({ badge_id: 1 });
userBadgeSchema.index({ user_id: 1 });
userBadgeSchema.index({ course_id: 1 });
userBadgeSchema.index({ award_date: -1 });
userBadgeSchema.index({ is_displayed: 1 });

// Compound index to prevent duplicate badge awards for the same user/course
userBadgeSchema.index({
  badge_id: 1,
  user_id: 1,
  course_id: 1
}, {
  unique: true,
  partialFilterExpression: { course_id: { $ne: null } }
});

// Update the updated_at field before saving
userBadgeSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('UserBadge', userBadgeSchema);
