const mongoose = require('mongoose');

/**
 * Certificate Model
 * Represents certificates issued to students
 */

const certificateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000,
    trim: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  certificateType: {
    type: String,
    enum: ['completion', 'achievement', 'participation', 'honor', 'other'],
    required: true
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issuedDate: {
    type: Date,
    required: true
  },
  expiryDate: Date,
  certificateNumber: {
    type: String,
    required: true,
    unique: true
  },
  grade: String,
  gpa: Number,
  credits: Number,
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program'
  },
  achievements: [String],
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active'
  },
  fileUrl: String,
  qrCode: String,
  verificationCode: {
    type: String,
    unique: true
  },
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
certificateSchema.index({ student: 1, certificateType: 1 });
certificateSchema.index({ issuedBy: 1 });
certificateSchema.index({ verificationCode: 1 });

// Update updatedAt on save
certificateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
