const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['github', 'slack', 'google', 'microsoft', 'jira'],
    required: true
  },
  accessToken: String,
  refreshToken: String,
  expiresAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: mongoose.Schema.Types.Mixed,
  connectedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Integration', integrationSchema);
