const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  menteeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'rejected'],
    default: 'pending'
  },
  goals: [String],
  message: String,
  startDate: Date,
  endDate: Date,
  sessions: [{
    date: Date,
    duration: Number,
    topic: String,
    notes: String,
    feedback: String
  }],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  rating: Number,
  review: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Mentorship', mentorshipSchema);
