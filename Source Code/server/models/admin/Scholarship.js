const mongoose = require('mongoose');

/**
 * Scholarship Model
 * Represents scholarships available for students
 */

const scholarshipSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  eligibility: {
    type: String,
    maxlength: 1000
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applications: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    documents: [{
      filename: String,
      url: String
    }]
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
scholarshipSchema.index({ deadline: 1, status: 1 });
scholarshipSchema.index({ createdBy: 1 });

// Update updatedAt on save
scholarshipSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Scholarship', scholarshipSchema);
