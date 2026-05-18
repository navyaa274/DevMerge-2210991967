const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'auto'
  },
  language: {
    type: String,
    default: 'en'
  },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  privacy: {
    profilePublic: { type: Boolean, default: true },
    showStats: { type: Boolean, default: true },
    allowMessages: { type: Boolean, default: true }
  },
  preferences: {
    codeEditorTheme: String,
    fontSize: { type: Number, default: 14 },
    autoSave: { type: Boolean, default: true }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UserPreferences', userPreferencesSchema);
