const mongoose = require('mongoose');

/**
 * Department Model
 * Represents academic departments in the university
 */

const departmentSchema = new mongoose.Schema({
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
  description: {
    type: String,
    maxlength: 1000,
    trim: true
  },
  hod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  establishedYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear()
  },
  contactInfo: {
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    },
    phone: {
      type: String,
      trim: true
    },
    office: {
      type: String,
      trim: true,
      maxlength: 100
    }
  },
  statistics: {
    totalStudents: {
      type: Number,
      default: 0,
      min: 0
    },
    totalFaculty: {
      type: Number,
      default: 0,
      min: 0
    },
    totalPrograms: {
      type: Number,
      default: 0,
      min: 0
    },
    totalCourses: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  gamificationConfig: {
    globalXpMultiplier: {
      type: Number,
      default: 1.0,
      min: 0.1
    },
    multiplierExpiry: {
      type: Date,
      default: null
    }
  },
  resources: {
    laboratories: [{
      name: String,
      capacity: Number,
      equipment: [String]
    }],
    classrooms: [{
      roomNumber: String,
      capacity: Number,
      type: {
        type: String,
        enum: ['lecture', 'lab', 'seminar', 'conference']
      }
    }]
  },
  // Legacy compatibility
  universityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: false
  },
  hodId: {
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
departmentSchema.index({ code: 1 }, { unique: true });
departmentSchema.index({ name: 1 });
departmentSchema.index({ isActive: 1 });
departmentSchema.index({ hod: 1 });
departmentSchema.index({ universityId: 1, code: 1 }, { unique: true, sparse: true });

// Virtuals
departmentSchema.virtual('programs', {
  ref: 'Program',
  localField: '_id',
  foreignField: 'department'
});

departmentSchema.virtual('faculty', {
  ref: 'User',
  localField: '_id',
  foreignField: 'department',
  match: { role: 'faculty' }
});

departmentSchema.virtual('students', {
  ref: 'User',
  localField: '_id',
  foreignField: 'department',
  match: { role: 'student' }
});

// Pre-save middleware
departmentSchema.pre('save', function (next) {
  if (this.isModified('code')) {
    this.code = this.code.toUpperCase();
  }
  // Sync legacy fields
  if (this.hod && !this.hodId) {
    this.hodId = this.hod;
  } else if (!this.hod && this.hodId) {
    this.hod = this.hodId;
  }
  next();
});

// Static methods
departmentSchema.statics.findActive = function () {
  return this.find({ isActive: true }).populate('hod', 'firstName lastName email');
};

departmentSchema.statics.findByCode = function (code) {
  return this.findOne({ code: code.toUpperCase() }).populate('hod', 'firstName lastName email');
};

// Query helpers
departmentSchema.query.active = function () {
  return this.where({ isActive: true });
};

departmentSchema.query.withHOD = function () {
  return this.populate('hod', 'firstName lastName email employeeId');
};

module.exports = mongoose.model('Department', departmentSchema);
