const mongoose = require('mongoose');

/**
 * Document Model
 * Represents documents uploaded by users
 */

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['academic', 'personal', 'administrative', 'certificate', 'other'],
    default: 'other'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String],
  expiryDate: Date,
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
documentSchema.index({ uploadedBy: 1, category: 1 });
documentSchema.index({ isPublic: 1 });

// Update updatedAt on save
documentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Document', documentSchema);
