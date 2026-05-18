const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Article title is required'],
    trim: true,
    maxlength: [500, 'Title cannot exceed 500 characters']
  },
  abstract: {
    type: String,
    trim: true
  },
  authors: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    affiliation: String,
    email: String,
    orcid: String,
    isCorrespondingAuthor: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  journal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Journal',
    required: true
  },
  issue: {
    volume: String,
    issue: String,
    year: Number,
    pages: String
  },
  doi: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  pmid: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  keywords: [{
    type: String,
    trim: true
  }],
  subjects: [{
    type: String,
    trim: true
  }],
  publicationDate: {
    type: Date,
    required: true
  },
  submissionDate: Date,
  acceptanceDate: Date,
  articleType: {
    type: String,
    enum: [
      'Research Article', 'Review Article', 'Case Report',
      'Short Communication', 'Letter to Editor', 'Editorial',
      'Book Review', 'Conference Paper', 'Technical Note'
    ],
    default: 'Research Article'
  },
  files: [{
    format: {
      type: String,
      enum: ['PDF', 'HTML', 'XML', 'DOC', 'Other'],
      required: true
    },
    size: {
      type: Number,
      required: true,
      min: [0, 'File size must be positive']
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    accessLevel: {
      type: String,
      enum: ['Open Access', 'Subscription', 'Embargoed', 'Restricted'],
      default: 'Subscription'
    },
    embargoDate: Date,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  references: [{
    citation: String,
    doi: String,
    pmid: String,
    authors: String,
    title: String,
    journal: String,
    year: Number,
    volume: String,
    pages: String
  }],
  citations: [{
    citingArticle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article'
    },
    citationText: String,
    citedDate: Date
  }],
  metrics: {
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    citations: {
      type: Number,
      default: 0
    },
    altmetricScore: Number,
    socialMediaShares: {
      twitter: Number,
      facebook: Number,
      linkedin: Number
    }
  },
  license: {
    type: String,
    enum: [
      'CC BY', 'CC BY-SA', 'CC BY-NC', 'CC BY-NC-SA',
      'CC BY-ND', 'CC BY-NC-ND', 'All Rights Reserved'
    ],
    default: 'All Rights Reserved'
  },
  funding: [{
    grantNumber: String,
    agency: String,
    country: String
  }],
  acknowledgments: {
    type: String,
    trim: true
  },
  conflictsOfInterest: {
    type: String,
    trim: true
  },
  dataAvailability: {
    statement: String,
    repository: String,
    doi: String,
    url: String
  },
  peerReview: {
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Accepted', 'Rejected', 'Published'],
      default: 'Submitted'
    },
    reviewers: [String],
    decisionDate: Date,
    revisionRounds: Number
  },
  departments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }],
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Published', 'Retracted', 'Withdrawn'],
    default: 'Draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Indexes
articleSchema.index({ title: 'text', abstract: 'text', keywords: 'text' });
articleSchema.index({ doi: 1 }, { unique: true, sparse: true });
articleSchema.index({ pmid: 1 }, { unique: true, sparse: true });
articleSchema.index({ journal: 1, publicationDate: -1 });
articleSchema.index({ 'authors.name': 1 });
articleSchema.index({ publicationDate: -1 });
articleSchema.index({ 'metrics.citations': -1 });

// Virtual for author names
articleSchema.virtual('authorNames').get(function() {
  return this.authors
    .sort((a, b) => a.order - b.order)
    .map(a => a.name)
    .join(', ');
});

// Virtual for corresponding author
articleSchema.virtual('correspondingAuthor').get(function() {
  const corresponding = this.authors.find(a => a.isCorrespondingAuthor);
  return corresponding || (this.authors.length > 0 ? this.authors[0] : null);
});

// Virtual for citation count (including external)
articleSchema.virtual('totalCitations').get(function() {
  return this.metrics.citations + (this.citations?.length || 0);
});

// Virtual for open access status
articleSchema.virtual('isOpenAccess').get(function() {
  const primaryFile = this.files[0];
  if (!primaryFile) return false;
  
  return primaryFile.accessLevel === 'Open Access' ||
         (primaryFile.embargoDate && new Date() > primaryFile.embargoDate);
});

// Pre-save middleware
articleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Ensure at least one corresponding author
  if (this.authors.length > 0 && !this.authors.some(a => a.isCorrespondingAuthor)) {
    this.authors[0].isCorrespondingAuthor = true;
  }
  
  // Sort authors by order
  this.authors.sort((a, b) => a.order - b.order);
  
  next();
});

// Static methods
articleSchema.statics.findByAuthor = function(authorName) {
  return this.find({ 'authors.name': new RegExp(authorName, 'i') });
};

articleSchema.statics.findOpenAccess = function() {
  return this.find({
    'files.accessLevel': 'Open Access',
    status: 'Published'
  });
};

articleSchema.statics.findRecent = function(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.find({
    publicationDate: { $gte: cutoffDate },
    status: 'Published'
  }).sort({ publicationDate: -1 });
};

articleSchema.statics.findHighlyCited = function(threshold = 10) {
  return this.find({
    'metrics.citations': { $gte: threshold },
    status: 'Published'
  }).sort({ 'metrics.citations': -1 });
};

// Instance methods
articleSchema.methods.addCitation = async function(citingArticleId, citationText) {
  if (!this.citations) {
    this.citations = [];
  }
  
  this.citations.push({
    citingArticle: citingArticleId,
    citationText,
    citedDate: new Date()
  });
  
  this.metrics.citations += 1;
  await this.save();
  return this;
};

articleSchema.methods.recordView = async function() {
  this.metrics.views += 1;
  await this.save();
  return this;
};

articleSchema.methods.recordDownload = async function() {
  this.metrics.downloads += 1;
  await this.save();
  return this;
};

articleSchema.methods.getBibtex = function() {
  const authorNames = this.authors
    .sort((a, b) => a.order - b.order)
    .map(a => a.name.split(' ').reverse().join(', '))
    .join(' and ');
  
  const year = this.publicationDate ? this.publicationDate.getFullYear() : 'n.d.';
  const title = this.title.replace(/[{}]/g, '');
  const journal = this.journal?.title || 'Unknown Journal';
  
  return `@article{${this.doi || this._id},
  author = {${authorNames}},
  title = {${title}},
  journal = {${journal}},
  year = {${year}},
  volume = {${this.issue?.volume || ''}},
  number = {${this.issue?.issue || ''}},
  pages = {${this.issue?.pages || ''}},
  doi = {${this.doi || ''}}
}`;
};

articleSchema.methods.getRIS = function() {
  const lines = [];
  lines.push('TY  - JOUR');
  lines.push(`TI  - ${this.title}`);
  
  this.authors.forEach(author => {
    lines.push(`AU  - ${author.name}`);
  });
  
  if (this.journal?.title) {
    lines.push(`JO  - ${this.journal.title}`);
  }
  
  if (this.publicationDate) {
    const year = this.publicationDate.getFullYear();
    lines.push(`PY  - ${year}`);
  }
  
  if (this.issue?.volume) {
    lines.push(`VL  - ${this.issue.volume}`);
  }
  
  if (this.issue?.issue) {
    lines.push(`IS  - ${this.issue.issue}`);
  }
  
  if (this.issue?.pages) {
    lines.push(`SP  - ${this.issue.pages}`);
  }
  
  if (this.doi) {
    lines.push(`DO  - ${this.doi}`);
  }
  
  lines.push('ER  - ');
  return lines.join('\n');
};

module.exports = mongoose.model('Article', articleSchema);