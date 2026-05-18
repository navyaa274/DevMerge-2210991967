const mongoose = require('mongoose');

/**
 * Research Model
 * Represents research projects and publications by faculty
 */

const researchSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  description: {
    type: String,
    maxlength: 2000,
    trim: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coResearchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  researchType: {
    type: String,
    enum: ['fundamental', 'applied', 'development', 'review'],
    required: true
  },
  field: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'published', 'abandoned'],
    default: 'ongoing'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  funding: {
    amount: Number,
    source: String,
    grantNumber: String
  },
  publications: [{
    title: String,
    journal: String,
    year: Number,
    doi: String,
    url: String
  }],
  keywords: [String],
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  milestones: [{
    title: String,
    description: String,
    dueDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
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
researchSchema.index({ faculty: 1, status: 1 });
researchSchema.index({ field: 1 });

// Update updatedAt on save
researchSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Research', researchSchema);
