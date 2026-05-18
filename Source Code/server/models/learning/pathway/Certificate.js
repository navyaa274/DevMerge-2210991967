const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  pathId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningPath'
  },
  title: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: Date,
  certificateNumber: {
    type: String,
    unique: true
  },
  verificationUrl: String,
  skills: [String],
  score: Number,
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);
