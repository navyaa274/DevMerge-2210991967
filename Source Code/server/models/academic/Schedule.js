const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['class', 'exam', 'assignment', 'meeting', 'event'],
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  location: String,
  meetingLink: String,
  relatedId: mongoose.Schema.Types.ObjectId,
  relatedModel: String,
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'notification', 'sms'],
      default: 'notification'
    },
    minutesBefore: Number
  }],
  attendees: [mongoose.Schema.Types.ObjectId],
  isRecurring: Boolean,
  recurrencePattern: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Schedule', scheduleSchema);
