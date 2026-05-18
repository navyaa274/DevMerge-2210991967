const mongoose = require('mongoose');

/**
 * Publication Model
 * Represents academic publications by faculty
 */

const publicationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  authors: [{
    name: String,
    affiliation: String,
    isCorresponding: {
      type: Boolean,
      default: false
    }
  }],
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  publicationType: {
    type: String,
    enum: ['journal', 'conference', 'book', 'book_chapter', 'patent', 'other'],
    required: true
  },
  journal: String,
  conference: String,
  publisher: String,
  volume: String,
  issue: String,
  pages: String,
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  doi: String,
  isbn: String,
  url: String,
  abstract: {
    type: String,
    maxlength: 2000
  },
  keywords: [String],
  citations: {
    type: Number,
    default: 0
  },
  impactFactor: Number,
  quartile: {
    type: String,
    enum: ['Q1', 'Q2', 'Q3', 'Q4']
  },
  status: {
    type: String,
    enum: ['submitted', 'accepted', 'published', 'rejected'],
    default: 'published'
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  research: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Research'
  },
  coAuthors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
publicationSchema.index({ faculty: 1, year: -1 });
publicationSchema.index({ publicationType: 1 });

// Update updatedAt on save
publicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Publication', publicationSchema);
