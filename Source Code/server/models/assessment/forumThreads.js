const mongoose = require('mongoose');

const forumThreadSchema = new mongoose.Schema({
  forum_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Forum',
    required: true
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  is_pinned: {
    type: Boolean,
    default: false
  },
  is_locked: {
    type: Boolean,
    default: false
  },
  is_anonymous: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  view_count: {
    type: Number,
    default: 0
  },
  reply_count: {
    type: Number,
    default: 0
  },
  last_reply_at: {
    type: Date,
    default: Date.now
  },
  last_reply_author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  upvotes: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  downvotes: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'hidden', 'deleted'],
    default: 'active'
  },
  moderated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderated_at: Date,
  moderation_reason: String,
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
forumThreadSchema.index({ forum_id: 1, created_at: -1 });
forumThreadSchema.index({ course_id: 1, is_pinned: -1, last_reply_at: -1 });
forumThreadSchema.index({ author_id: 1 });
forumThreadSchema.index({ status: 1 });
forumThreadSchema.index({ tags: 1 });

// Virtual for vote count
forumThreadSchema.virtual('vote_count').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

// Update the updated_at field before saving
forumThreadSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('ForumThread', forumThreadSchema);
