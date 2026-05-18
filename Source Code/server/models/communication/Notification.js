const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['assignment', 'exam', 'submission', 'announcement', 'badge', 'mentorship', 'review', 'message'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: String,
  relatedId: mongoose.Schema.Types.ObjectId,
  relatedModel: String,
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  actionUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date
});

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
