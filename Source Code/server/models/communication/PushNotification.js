const mongoose = require('mongoose');

const pushNotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  body: String,
  type: {
    type: String,
    enum: ['assignment', 'exam', 'submission', 'badge', 'message'],
    required: true
  },
  relatedId: mongoose.Schema.Types.ObjectId,
  isSent: {
    type: Boolean,
    default: false
  },
  sentAt: Date,
  readAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PushNotification', pushNotificationSchema);
