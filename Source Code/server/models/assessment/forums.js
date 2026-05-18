const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  allow_student_posts: {
    type: Boolean,
    default: true
  },
  allow_anonymous_posts: {
    type: Boolean,
    default: false
  },
  moderated: {
    type: Boolean,
    default: false
  },
  moderator_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  thread_count: {
    type: Number,
    default: 0
  },
  last_activity_at: {
    type: Date,
    default: Date.now
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
forumSchema.index({ course_id: 1 });
forumSchema.index({ is_active: 1 });
forumSchema.index({ last_activity_at: -1 });

// Update the updated_at field before saving
forumSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Forum', forumSchema);
