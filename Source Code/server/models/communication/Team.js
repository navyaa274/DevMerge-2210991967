const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  leaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    userId: mongoose.Schema.Types.ObjectId,
    role: {
      type: String,
      enum: ['leader', 'member', 'moderator'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  projects: [mongoose.Schema.Types.ObjectId],
  contests: [mongoose.Schema.Types.ObjectId],
  totalScore: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isStudyGroup: { type: Boolean, default: false }, // Phase 6 Item 28
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Team', teamSchema);
