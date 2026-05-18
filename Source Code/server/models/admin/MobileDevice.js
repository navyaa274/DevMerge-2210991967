const mongoose = require('mongoose');

const mobileDeviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceId: {
    type: String,
    unique: true
  },
  deviceType: {
    type: String,
    enum: ['ios', 'android', 'web'],
    required: true
  },
  pushToken: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MobileDevice', mobileDeviceSchema);
