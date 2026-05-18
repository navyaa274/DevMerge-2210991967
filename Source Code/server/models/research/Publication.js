const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Publication title is required'],
    trim: true,
    maxlength: [500, 'Title cannot exceed 500 characters']
  },
  abstract: {
    type: String,
    trim: true
  },
  authors: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    email: String,
    affiliation: String,
    isCorrespondingAuthor: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      required: true
    }
  }],
  publicationType: {
    type: String,
    required: [true, 'Publication type is required'],
    enum: [
      'Journal Article', 'Conference Paper', 'Book Chapter', 'Book',
      'Technical Report', 'Thesis', 'Dissertation', 'Preprint',
      'Working Paper', 'Patent', 'Software', 'Dataset'
    ]
  },
  journal: {
    name: String,
    volume: String,
    issue: String,
    pages: String,
    issn: String,
    publisher: String,
    impactFactor: Number,
    quartile: {
      type: String,
      enum: ['Q1', 'Q2', 'Q3', 'Q4', null]
    }
  },
  conference: {
    name: String,
    location: String,
    date: Date,
    proceedings: String,
    isbn: String
  },
  book: {
    title: String,
    publisher: String,
    edition: String,
    isbn: String,
    editors: [String]
  },
  doi: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  arxivId: {
    type: String,
    trim: true
  },
  pmid: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    trim: true
  },
  publicationDate: {
    type: Date,
    required: [true, 'Publication date is required']
  },
  submissionDate: Date,
  acceptanceDate: Date,
  keywords: [{
    type: String,
    trim: true
  }],
  researchAreas: [{
    type: String,
    trim: true
  }],
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResearchProject'
  }],
  departments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }],
  funding: [{
    grantNumber: String,
    agency: String,
    acknowledgment: String
  }],
  files: [{
    name: String,
    type: {
      type: String,
      enum: ['Manuscript', 'Supplementary Material', 'Data', 'Code', 'Figures']
    },
    size: Number,
    path: String,
    accessLevel: {
      type: String,
      enum: ['Public', 'Institutional', 'Private'],
      default: 'Institutional'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  metrics: {
    citations: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    altmetricScore: Number,
    fieldCitationRatio: Number
  },
  externalMetrics: {
    googleScholarCitations: Number,
    scopusCitations: Number,
    webOfScienceCitations: Number,
    lastUpdated: Date
  },
  license: {
    type: String,
    enum: ['CC BY', 'CC BY-SA', 'CC BY-NC', 'CC BY-NC-SA', 'CC BY-ND', 'CC BY-NC-ND', 'All Rights Reserved', 'Public Domain'],
    default: 'All Rights Reserved'
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Under Review', 'Accepted', 'Published', 'Retracted'],
    default: 'Draft'
  },
  visibility: {
    type: String,
    enum: ['Public', 'Institutional', 'Private'],
    default: 'Institutional'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
publicationSchema.index({ title: 'text', abstract: 'text', keywords: 'text' });
publicationSchema.index({ doi: 1 }, { unique: true, sparse: true });
publicationSchema.index({ 'authors.user': 1 });
publicationSchema.index({ publicationType: 1, publicationDate: -1 });
publicationSchema.index({ 'metrics.citations': -1 });
publicationSchema.index({ 'departments': 1 });

// Virtual for author names string
publicationSchema.virtual('authorNames').get(function() {
  return this.authors.map(a => a.name).join(', ');
});

// Virtual for citation count (sum of internal and external)
publicationSchema.virtual('totalCitations').get(function() {
  const internal = this.metrics.citations || 0;
  const external = (this.externalMetrics?.googleScholarCitations || 0) +
                   (this.externalMetrics?.scopusCitations || 0) +
                   (this.externalMetrics?.webOfScienceCitations || 0);
  return internal + external;
});

// Pre-save middleware to update updatedAt
publicationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Ensure at least one author is marked as corresponding if not set
  if (this.authors.length > 0 && !this.authors.some(a => a.isCorrespondingAuthor)) {
    this.authors[0].isCorrespondingAuthor = true;
  }
  
  next();
});

// Static method to find publications by author
publicationSchema.statics.findByAuthor = function(userId) {
  return this.find({ 'authors.user': userId });
};

// Static method to find high-impact publications
publicationSchema.statics.findHighImpact = function(threshold = 10) {
  return this.find({ 'metrics.citations': { $gte: threshold } });
};

// Static method to find recent publications
publicationSchema.statics.findRecent = function(days = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return this.find({ publicationDate: { $gte: cutoffDate } });
};

// Instance method to add citation
publicationSchema.methods.addCitation = function() {
  this.metrics.citations += 1;
  return this.save();
};

// Instance method to check if user is author
publicationSchema.methods.isAuthor = function(userId) {
  return this.authors.some(author => author.user && author.user.equals(userId));
};

module.exports = mongoose.models.Publication || mongoose.model('Publication', publicationSchema);