const mongoose = require('mongoose');

/**
 * Program Model
 * Represents academic programs offered by departments
 */

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    maxlength: 10,
    match: /^[A-Z0-9-]+$/
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  description: {
    type: String,
    maxlength: 1000,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  degreeType: {
    type: String,
    required: true,
    enum: ['bachelors', 'masters', 'doctorate', 'diploma', 'certificate']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  accreditation: {
    accredited: {
      type: Boolean,
      default: false
    },
    accreditingBody: String,
    accreditationDate: Date,
    validUntil: Date
  },
  curriculum: {
    totalCredits: {
      type: Number,
      required: true,
      min: 1
    },
    coreCredits: {
      type: Number,
      min: 0
    },
    electiveCredits: {
      type: Number,
      min: 0
    },
    labCredits: {
      type: Number,
      min: 0
    }
  },
  admission: {
    minimumGPA: {
      type: Number,
      min: 0,
      max: 4
    },
    requiredSubjects: [String],
    entranceExam: {
      required: Boolean,
      examName: String,
      minimumScore: Number
    },
    intakeCapacity: {
      type: Number,
      min: 1
    }
  },
  outcomes: {
    programOutcomes: [String],
    programSpecificOutcomes: [String],
    careerOpportunities: [String]
  },
  statistics: {
    currentEnrollment: {
      type: Number,
      default: 0,
      min: 0
    },
    totalGraduates: {
      type: Number,
      default: 0,
      min: 0
    },
    placementRate: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  // Legacy compatibility
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  durationYears: {
    type: Number
  },
  totalSemesters: {
    type: Number
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
programSchema.index({ code: 1 }, { unique: true });
programSchema.index({ name: 1 });
programSchema.index({ department: 1 });
programSchema.index({ isActive: 1 });
programSchema.index({ degreeType: 1 });
programSchema.index({ departmentId: 1, code: 1 }, { unique: true, sparse: true });

// Virtuals
programSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'program'
});

programSchema.virtual('students', {
  ref: 'User',
  localField: '_id',
  foreignField: 'programId',
  match: { role: 'student' }
});

programSchema.virtual('departmentInfo', {
  ref: 'Department',
  localField: 'department',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware
programSchema.pre('save', function (next) {
  if (this.isModified('code')) {
    this.code = this.code.toUpperCase();
  }

  // Sync legacy fields
  if (this.isModified('department')) {
    this.departmentId = this.department;
  } else if (this.isModified('departmentId')) {
    this.department = this.departmentId;
  }

  // Always sync primary duration to legacy durationYears and calculate semesters
  if (this.isModified('duration')) {
    this.durationYears = this.duration;
    this.totalSemesters = this.duration * 2; // Assuming 2 semesters per year
  }

  next();
});

// Static methods
programSchema.statics.findActive = function () {
  return this.find({ isActive: true }).populate('department', 'name code');
};

programSchema.statics.findByDepartment = function (departmentId) {
  return this.find({ department: departmentId, isActive: true });
};

programSchema.statics.findByDegreeType = function (degreeType) {
  return this.find({ degreeType, isActive: true }).populate('department', 'name code');
};

// Query helpers
programSchema.query.active = function () {
  return this.where({ isActive: true });
};

programSchema.query.withDepartment = function () {
  return this.populate('department', 'name code hod');
};

programSchema.query.withCourses = function () {
  return this.populate({
    path: 'courses',
    match: { isActive: true },
    select: 'name code credits semester'
  });
};

module.exports = mongoose.model('Program', programSchema);
