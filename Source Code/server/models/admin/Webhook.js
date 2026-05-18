const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  url: {
    type: String,
    required: true
  },
  events: [{
    type: String,
    enum: ['submission.accepted', 'course.completed', 'contest.finished', 'risk.detected', 'interview.scheduled'],
    required: true
  }],
  secret: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastTriggered: Date,
  failureCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Webhook', webhookSchema);
