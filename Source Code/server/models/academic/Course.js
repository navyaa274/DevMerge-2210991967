const mongoose = require('mongoose');

/**
 * Course Model
 * Represents academic courses offered within programs
 */

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: 10,
    match: /^[A-Z0-9]+$/
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: true
  },
  description: {
    type: String,
    maxlength: 2000,
    trim: true
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  approvalStatus: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'rejected', 'requires_revision'],
    default: 'draft'
  },
  approvalDetails: {
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submittedAt: {
      type: Date,
      default: null
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    reviewComments: {
      type: String,
      maxlength: 1000
    },
    rejectionReason: {
      type: String,
      maxlength: 1000
    }
  },
  courseType: {
    type: String,
    enum: ['core', 'elective', 'lab', 'seminar', 'project'],
    default: 'core'
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  clonedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear'
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    timings: [{
      dayOfWeek: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      startTime: String,
      endTime: String,
      room: String
    }],
    totalHours: Number
  },
  curriculum: {
    objectives: [String],
    outcomes: [String],
    prerequisites: [String],
    syllabus: [{
      week: Number,
      topic: String,
      description: String,
      readings: [String],
      assignments: [String]
    }],
    textbooks: [{
      title: String,
      author: String,
      isbn: String,
      edition: String
    }],
    references: [String]
  },
  assessment: {
    gradingScheme: {
      assignments: {
        type: Number,
        min: 0,
        max: 100,
        default: 20
      },
      midterm: {
        type: Number,
        min: 0,
        max: 100,
        default: 30
      },
      final: {
        type: Number,
        min: 0,
        max: 100,
        default: 40
      },
      attendance: {
        type: Number,
        min: 0,
        max: 100,
        default: 10
      }
    },
    passingGrade: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    }
  },
  resources: {
    classroom: String,
    laboratory: String,
    equipment: [String],
    software: [String],
    onlineResources: [{
      name: String,
      url: String,
      type: {
        type: String,
        enum: ['video', 'document', 'website', 'tool']
      }
    }]
  },
  enrollment: {
    maxCapacity: {
      type: Number,
      min: 1
    },
    currentEnrollment: {
      type: Number,
      default: 0,
      min: 0
    },
    waitlist: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      waitlistDate: {
        type: Date,
        default: Date.now
      }
    }]
  },
  statistics: {
    averageGrade: {
      type: Number,
      min: 0,
      max: 100
    },
    passRate: {
      type: Number,
      min: 0,
      max: 100
    },
    dropoutRate: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  // Legacy compatibility
  title: {
    type: String
  },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program'
  },
  semesterNumber: {
    type: Number
  },
  facultyIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  modules: [{
    title: String,
    description: String,
    materials: [String],
    order: Number
  }],
  assignments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  }],
  problems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }],
  startDate: Date,
  endDate: Date,
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
courseSchema.index({ code: 1 }, { unique: true });
courseSchema.index({ name: 1 });
courseSchema.index({ department: 1 });
courseSchema.index({ program: 1 });
courseSchema.index({ semester: 1 });
courseSchema.index({ faculty: 1 });
courseSchema.index({ isActive: 1 });
courseSchema.index({ programId: 1, semesterNumber: 1 }, { unique: false, sparse: true });

// Virtuals
courseSchema.virtual('enrolledStudents', {
  ref: 'User',
  localField: '_id',
  foreignField: 'enrolledCourses.course',
  match: { role: 'student' }
});

courseSchema.virtual('courseAssignments', {
  ref: 'Assignment',
  localField: '_id',
  foreignField: 'course',
  match: { isActive: true }
});

courseSchema.virtual('submissions', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'course'
});

// Pre-save middleware
courseSchema.pre('save', function (next) {
  if (this.isModified('code')) {
    this.code = this.code.toUpperCase();
  }

  // Sync legacy fields
  if (!this.title && this.name) {
    this.title = this.name;
  } else if (this.title && !this.name) {
    this.name = this.title;
  }

  if (this.program && !this.programId) {
    this.programId = this.program;
  } else if (!this.program && this.programId) {
    this.program = this.programId;
  }

  if (this.semester && !this.semesterNumber) {
    this.semesterNumber = this.semester;
  }

  if (this.faculty && !this.facultyIds.includes(this.faculty)) {
    this.facultyIds = [this.faculty];
  }

  // Sync schedule dates
  if (this.schedule?.startDate && !this.startDate) {
    this.startDate = this.schedule.startDate;
  }
  if (this.schedule?.endDate && !this.endDate) {
    this.endDate = this.schedule.endDate;
  }

  next();
});

// Static methods
courseSchema.statics.findActive = function () {
  return this.find({ isActive: true }).populate('faculty', 'firstName lastName email').populate('department', 'name code');
};

courseSchema.statics.findByDepartment = function (departmentId) {
  return this.find({ department: departmentId, isActive: true });
};

courseSchema.statics.findByProgram = function (programId) {
  return this.find({ program: programId, isActive: true });
};

courseSchema.statics.findByFaculty = function (facultyId) {
  return this.find({ faculty: facultyId, isActive: true }).populate('program', 'name code');
};

courseSchema.statics.findBySemester = function (semester) {
  return this.find({ semester, isActive: true }).populate('department', 'name code');
};

// Query helpers
courseSchema.query.active = function () {
  return this.where({ isActive: true });
};

courseSchema.query.withFaculty = function () {
  return this.populate('faculty', 'firstName lastName email employeeId');
};

courseSchema.query.withDepartment = function () {
  return this.populate('department', 'name code');
};

courseSchema.query.withProgram = function () {
  return this.populate('program', 'name code degreeType');
};

module.exports = mongoose.model('Course', courseSchema);
