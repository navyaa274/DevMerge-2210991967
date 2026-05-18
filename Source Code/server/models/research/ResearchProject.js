const mongoose = require('mongoose');

const researchProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Research project title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Research description is required'],
    trim: true
  },
  abstract: {
    type: String,
    trim: true
  },
  facultyLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Faculty lead is required']
  },
  coInvestigators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  studentResearchers: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['Undergraduate Researcher', 'Graduate Researcher', 'Research Assistant', 'PhD Candidate']
    },
    startDate: Date,
    endDate: Date
  }],
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  researchArea: {
    type: String,
    required: [true, 'Research area is required'],
    enum: [
      'Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Chemistry',
      'Biology', 'Medicine', 'Psychology', 'Sociology', 'Economics',
      'Business', 'Education', 'Arts', 'Humanities', 'Interdisciplinary'
    ]
  },
  subAreas: [{
    type: String,
    trim: true
  }],
  funding: {
    grantNumber: String,
    fundingAgency: String,
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['Applied', 'Awarded', 'In Progress', 'Completed', 'Terminated'],
      default: 'Applied'
    }
  },
  timeline: {
    startDate: {
      type: Date,
      required: [true, 'Project start date is required']
    },
    expectedEndDate: Date,
    actualEndDate: Date,
    milestones: [{
      title: String,
      description: String,
      dueDate: Date,
      completedDate: Date,
      status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Delayed'],
        default: 'Pending'
      }
    }]
  },
  publications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publication'
  }],
  datasets: [{
    name: String,
    description: String,
    size: Number,
    format: String,
    accessLevel: {
      type: String,
      enum: ['Public', 'Restricted', 'Private'],
      default: 'Restricted'
    },
    storageLocation: String,
    uploadDate: Date
  }],
  equipment: [{
    name: String,
    description: String,
    quantity: Number,
    specifications: String,
    availability: {
      type: String,
      enum: ['Available', 'In Use', 'Maintenance', 'Retired'],
      default: 'Available'
    }
  }],
  ethicsApproval: {
    approvalNumber: String,
    approvalDate: Date,
    expiryDate: Date,
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Expired'],
      default: 'Pending'
    },
    documents: [String]
  },
  status: {
    type: String,
    enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Archived'],
    default: 'Planning'
  },
  visibility: {
    type: String,
    enum: ['Public', 'Department Only', 'Private'],
    default: 'Department Only'
  },
  tags: [{
    type: String,
    trim: true
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
    impactScore: {
      type: Number,
      default: 0
    }
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
researchProjectSchema.index({ title: 'text', description: 'text', abstract: 'text' });
researchProjectSchema.index({ facultyLead: 1, status: 1 });
researchProjectSchema.index({ department: 1, researchArea: 1 });
researchProjectSchema.index({ 'funding.status': 1 });
researchProjectSchema.index({ createdAt: -1 });

// Virtual for project duration
researchProjectSchema.virtual('duration').get(function() {
  if (!this.timeline.startDate) return null;
  const endDate = this.timeline.actualEndDate || this.timeline.expectedEndDate || new Date();
  const durationMs = endDate - this.timeline.startDate;
  const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
  return durationDays;
});

// Virtual for active student researchers
researchProjectSchema.virtual('activeStudentResearchers').get(function() {
  return this.studentResearchers.filter(sr => 
    !sr.endDate || sr.endDate > new Date()
  );
});

// Pre-save middleware to update updatedAt
researchProjectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find active projects
researchProjectSchema.statics.findActive = function() {
  return this.find({ status: 'Active' });
};

// Static method to find projects by faculty
researchProjectSchema.statics.findByFaculty = function(facultyId) {
  return this.find({
    $or: [
      { facultyLead: facultyId },
      { coInvestigators: facultyId }
    ]
  });
};

// Instance method to check if user is involved in project
researchProjectSchema.methods.isUserInvolved = function(userId) {
  return this.facultyLead.equals(userId) || 
         this.coInvestigators.some(coId => coId.equals(userId)) ||
         this.studentResearchers.some(sr => sr.student.equals(userId));
};

module.exports = mongoose.model('ResearchProject', researchProjectSchema);