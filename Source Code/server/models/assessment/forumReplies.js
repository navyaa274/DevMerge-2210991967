const mongoose = require('mongoose');

const forumReplySchema = new mongoose.Schema({
  thread_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumThread',
    required: true
  },
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
  is_anonymous: {
    type: Boolean,
    default: false
  },
  parent_reply_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumReply'
  },
  reply_level: {
    type: Number,
    default: 0,
    min: 0,
    max: 5 // Maximum nesting level
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
  attachments: [{
    filename: String,
    original_name: String,
    mime_type: String,
    size: Number,
    url: String,
    uploaded_at: {
      type: Date,
      default: Date.now
    }
  }],
  edited: {
    type: Boolean,
    default: false
  },
  edited_at: Date,
  edited_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
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
forumReplySchema.index({ thread_id: 1, created_at: 1 });
forumReplySchema.index({ author_id: 1 });
forumReplySchema.index({ parent_reply_id: 1 });
forumReplySchema.index({ status: 1 });

// Virtual for vote count
forumReplySchema.virtual('vote_count').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

// Update the updated_at field before saving
forumReplySchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('ForumReply', forumReplySchema);
