const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Journal title is required'],
    trim: true,
    maxlength: [300, 'Title cannot exceed 300 characters']
  },
  issn: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  eissn: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  publisher: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  subjects: [{
    type: String,
    trim: true
  }],
  keywords: [{
    type: String,
    trim: true
  }],
  impactFactor: {
    type: Number,
    min: [0, 'Impact factor must be positive']
  },
  quartile: {
    type: String,
    enum: ['Q1', 'Q2', 'Q3', 'Q4', null]
  },
  category: {
    type: String,
    enum: [
      'Science', 'Technology', 'Engineering', 'Mathematics',
      'Medicine', 'Health Sciences', 'Social Sciences',
      'Humanities', 'Arts', 'Business', 'Law', 'Education',
      'Interdisciplinary'
    ]
  },
  frequency: {
    type: String,
    enum: [
      'Daily', 'Weekly', 'Bi-weekly', 'Monthly',
      'Bi-monthly', 'Quarterly', 'Semi-annual', 'Annual',
      'Irregular'
    ],
    default: 'Monthly'
  },
  openAccess: {
    type: Boolean,
    default: false
  },
  license: {
    type: String,
    enum: [
      'CC BY', 'CC BY-SA', 'CC BY-NC', 'CC BY-NC-SA',
      'CC BY-ND', 'CC BY-NC-ND', 'Subscription', 'Hybrid'
    ],
    default: 'Subscription'
  },
  website: {
    type: String,
    trim: true
  },
  submissionGuidelines: {
    type: String,
    trim: true
  },
  indexing: [{
    database: String,
    coverage: String,
    url: String
  }],
  issues: [{
    volume: String,
    issue: String,
    year: Number,
    publicationDate: Date,
    articles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article'
    }],
    coverImage: String,
    tableOfContents: String
  }],
  subscription: {
    type: {
      type: String,
      enum: ['Institutional', 'Departmental', 'Individual', 'Open Access'],
      default: 'Institutional'
    },
    startDate: Date,
    endDate: Date,
    cost: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    autoRenew: {
      type: Boolean,
      default: true
    }
  },
  metrics: {
    totalArticles: {
      type: Number,
      default: 0
    },
    totalCitations: {
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
    acceptanceRate: Number
  },
  departments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Discontinued', 'Suspended'],
    default: 'Active'
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
journalSchema.index({ title: 'text', description: 'text', subjects: 'text' });
journalSchema.index({ issn: 1 }, { unique: true, sparse: true });
journalSchema.index({ eissn: 1 }, { unique: true, sparse: true });
journalSchema.index({ category: 1, 'metrics.totalCitations': -1 });
journalSchema.index({ openAccess: 1 });

// Virtual for current issue
journalSchema.virtual('currentIssue').get(function() {
  if (!this.issues || this.issues.length === 0) return null;
  
  return this.issues
    .filter(issue => issue.publicationDate <= new Date())
    .sort((a, b) => b.publicationDate - a.publicationDate)[0];
});

// Virtual for subscription status
journalSchema.virtual('subscriptionStatus').get(function() {
  if (!this.subscription || !this.subscription.endDate) return 'Unknown';
  
  const now = new Date();
  if (now > this.subscription.endDate) return 'Expired';
  if (now > new Date(this.subscription.endDate.getTime() - 30 * 24 * 60 * 60 * 1000)) {
    return 'Expiring Soon';
  }
  return 'Active';
});

// Pre-save middleware
journalSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate total articles
  if (this.issues) {
    this.metrics.totalArticles = this.issues.reduce(
      (total, issue) => total + (issue.articles?.length || 0),
      0
    );
  }
  
  next();
});

// Static methods
journalSchema.statics.findBySubject = function(subject) {
  return this.find({ subjects: new RegExp(subject, 'i') });
};

journalSchema.statics.findOpenAccess = function() {
  return this.find({ openAccess: true, status: 'Active' });
};

journalSchema.statics.findHighImpact = function(threshold = 2.0) {
  return this.find({
    impactFactor: { $gte: threshold },
    status: 'Active'
  }).sort({ impactFactor: -1 });
};

// Instance methods
journalSchema.methods.addIssue = async function(issueData) {
  if (!this.issues) {
    this.issues = [];
  }
  
  this.issues.push(issueData);
  await this.save();
  return this;
};

journalSchema.methods.getArticles = function() {
  // This would populate articles from all issues
  // For now, return article count
  return {
    total: this.metrics.totalArticles,
    byYear: this.getArticlesByYear()
  };
};

journalSchema.methods.getArticlesByYear = function() {
  if (!this.issues) return {};
  
  const articlesByYear = {};
  this.issues.forEach(issue => {
    if (issue.year && issue.articles) {
      if (!articlesByYear[issue.year]) {
        articlesByYear[issue.year] = 0;
      }
      articlesByYear[issue.year] += issue.articles.length;
    }
  });
  
  return articlesByYear;
};

module.exports = mongoose.model('Journal', journalSchema);