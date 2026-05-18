const mongoose = require('mongoose');

const grantSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Grant title is required'],
    trim: true,
    maxlength: [300, 'Title cannot exceed 300 characters']
  },
  description: {
    type: String,
    required: [true, 'Grant description is required'],
    trim: true
  },
  grantNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  fundingAgency: {
    type: String,
    required: [true, 'Funding agency is required'],
    trim: true
  },
  agencyType: {
    type: String,
    enum: [
      'Government', 'Foundation', 'Corporate', 'International',
      'University', 'Non-profit', 'Other'
    ],
    default: 'Government'
  },
  program: {
    type: String,
    trim: true
  },
  principalInvestigator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Principal investigator is required']
  },
  coInvestigators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    role: String,
    allocation: Number, // Percentage of time/effort
    institution: String
  }],
  collaborators: [{
    name: String,
    institution: String,
    country: String,
    role: String
  }],
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  researchAreas: [{
    type: String,
    trim: true
  }],
  keywords: [{
    type: String,
    trim: true
  }],
  budget: {
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Amount must be positive']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    durationMonths: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 month']
    },
    breakdown: {
      personnel: Number,
      equipment: Number,
      travel: Number,
      materials: Number,
      indirectCosts: Number,
      other: Number
    },
    matchingFunds: Number,
    inKindContributions: Number
  },
  timeline: {
    applicationDate: Date,
    submissionDate: {
      type: Date,
      required: [true, 'Submission date is required']
    },
    reviewStartDate: Date,
    reviewEndDate: Date,
    awardDate: Date,
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    reportingDates: [{
      reportType: String,
      dueDate: Date,
      submittedDate: Date,
      status: {
        type: String,
        enum: ['Pending', 'Submitted', 'Approved', 'Rejected']
      }
    }],
    milestones: [{
      description: String,
      dueDate: Date,
      completedDate: Date,
      status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Delayed']
      }
    }]
  },
  deliverables: [{
    type: {
      type: String,
      enum: ['Publication', 'Report', 'Software', 'Dataset', 'Prototype', 'Training']
    },
    description: String,
    dueDate: Date,
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Delayed']
    },
    notes: String
  }],
  status: {
    type: String,
    enum: [
      'Draft', 'Submitted', 'Under Review', 'Awarded', 'Active',
      'Completed', 'Terminated', 'Rejected', 'Withdrawn'
    ],
    default: 'Draft'
  },
  review: {
    score: Number,
    comments: String,
    reviewers: [String],
    decisionDate: Date,
    decisionLetter: String
  },
  compliance: {
    ethicsApproval: {
      required: Boolean,
      approvalNumber: String,
      approvalDate: Date,
      expiryDate: Date
    },
    dataManagementPlan: {
      required: Boolean,
      planSubmitted: Boolean,
      planApproved: Boolean
    },
    openAccess: {
      required: Boolean,
      policy: String,
      complianceStatus: {
        type: String,
        enum: ['Compliant', 'Non-compliant', 'Pending']
      }
    }
  },
  documents: [{
    name: String,
    type: {
      type: String,
      enum: [
        'Proposal', 'Budget', 'CV', 'Support Letter', 'Ethics Approval',
        'Progress Report', 'Final Report', 'Publication', 'Other'
      ]
    },
    filePath: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    accessLevel: {
      type: String,
      enum: ['Public', 'Internal', 'Restricted'],
      default: 'Internal'
    }
  }],
  metrics: {
    publicationsCount: {
      type: Number,
      default: 0
    },
    studentsSupported: {
      type: Number,
      default: 0
    },
    patentsFiled: {
      type: Number,
      default: 0
    },
    collaborationsEstablished: {
      type: Number,
      default: 0
    },
    impactScore: Number
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
grantSchema.index({ grantNumber: 1 }, { unique: true, sparse: true });
grantSchema.index({ principalInvestigator: 1, status: 1 });
grantSchema.index({ fundingAgency: 1, 'timeline.startDate': -1 });
grantSchema.index({ status: 1, 'timeline.endDate': 1 });
grantSchema.index({ title: 'text', description: 'text', keywords: 'text' });

// Virtual for grant duration in months
grantSchema.virtual('durationMonths').get(function() {
  if (!this.timeline.startDate || !this.timeline.endDate) return 0;
  const start = new Date(this.timeline.startDate);
  const end = new Date(this.timeline.endDate);
  const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                 (end.getMonth() - start.getMonth());
  return Math.max(months, 1);
});

// Virtual for monthly budget
grantSchema.virtual('monthlyBudget').get(function() {
  if (!this.budget.totalAmount || !this.durationMonths) return 0;
  return this.budget.totalAmount / this.durationMonths;
});

// Virtual for time remaining
grantSchema.virtual('timeRemaining').get(function() {
  if (!this.timeline.endDate) return null;
  const now = new Date();
  const end = new Date(this.timeline.endDate);
  const diffMs = end - now;
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
});

// Pre-save middleware
grantSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate budget breakdown percentages if not set
  if (this.budget.totalAmount && this.budget.breakdown) {
    const breakdown = this.budget.breakdown;
    const total = Object.values(breakdown).reduce((sum, val) => sum + (val || 0), 0);
    
    if (total > 0 && total !== this.budget.totalAmount) {
      // Scale breakdown to match total amount
      const scale = this.budget.totalAmount / total;
      for (const key in breakdown) {
        if (breakdown[key]) {
          breakdown[key] = Math.round(breakdown[key] * scale * 100) / 100;
        }
      }
    }
  }
  
  next();
});

// Static method to find active grants
grantSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    status: 'Active',
    'timeline.endDate': { $gte: now }
  });
};

// Static method to find grants by PI
grantSchema.statics.findByPrincipalInvestigator = function(userId) {
  return this.find({ principalInvestigator: userId });
};

// Static method to find grants by funding agency
grantSchema.statics.findByAgency = function(agency) {
  return this.find({ fundingAgency: new RegExp(agency, 'i') });
};

// Instance method to check if grant is overdue
grantSchema.methods.isOverdue = function() {
  if (this.status !== 'Active') return false;
  
  const now = new Date();
  const overdueReports = this.timeline.reportingDates?.filter(report => 
    report.dueDate && report.dueDate < now && report.status !== 'Submitted'
  );
  
  return overdueReports && overdueReports.length > 0;
};

// Instance method to add publication
grantSchema.methods.addPublication = function(publicationId) {
  // This would typically be handled through a separate association
  // For now, we'll increment the publications count
  this.metrics.publicationsCount += 1;
  return this.save();
};

module.exports = mongoose.model('Grant', grantSchema);