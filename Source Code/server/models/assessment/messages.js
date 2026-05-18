const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  thread_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MessageThread',
    required: true
  },
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  message_type: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
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
  reply_to_message_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  edited: {
    type: Boolean,
    default: false
  },
  edited_at: Date,
  edited_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  read_by: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    read_at: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'deleted'],
    default: 'sent'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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
messageSchema.index({ thread_id: 1, created_at: 1 });
messageSchema.index({ sender_id: 1, created_at: -1 });
messageSchema.index({ 'read_by.user_id': 1 });

// Virtual for delivery status
messageSchema.virtual('delivery_status').get(function() {
  if (this.status === 'read') return 'read';
  if (this.status === 'delivered') return 'delivered';
  return 'sent';
});

// Update the updated_at field before saving
messageSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Message', messageSchema);
