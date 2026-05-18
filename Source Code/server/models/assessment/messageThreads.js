const mongoose = require('mongoose');

const messageThreadSchema = new mongoose.Schema({
  subject: {
    type: String,
    trim: true,
    maxlength: 200
  },
  participants: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joined_at: {
      type: Date,
      default: Date.now
    },
    last_read_at: {
      type: Date,
      default: Date.now
    },
    is_active: {
      type: Boolean,
      default: true
    }
  }],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  last_message_at: {
    type: Date,
    default: Date.now
  },
  last_message_preview: {
    type: String,
    trim: true,
    maxlength: 100
  },
  message_count: {
    type: Number,
    default: 0
  },
  is_group: {
    type: Boolean,
    default: false
  },
  group_name: {
    type: String,
    trim: true
  },
  group_description: {
    type: String,
    trim: true
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  type: {
    type: String,
    enum: ['direct', 'course_group', 'support'],
    default: 'direct'
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
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
messageThreadSchema.index({ 'participants.user_id': 1, status: 1 });
messageThreadSchema.index({ course_id: 1, type: 1 });
messageThreadSchema.index({ last_message_at: -1 });
messageThreadSchema.index({ created_by: 1 });

// Virtual for unread count for a specific user
messageThreadSchema.methods.getUnreadCount = function(userId) {
  const participant = this.participants.find(p => p.user_id.toString() === userId.toString());
  if (!participant) return 0;

  // This would need to be calculated based on messages created after last_read_at
  // For now, returning a placeholder
  return 0;
};

// Update the updated_at field before saving
messageThreadSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('MessageThread', messageThreadSchema);
