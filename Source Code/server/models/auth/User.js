const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },

  // Profile Information
  profilePicture: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    match: [/^[+]?[\d\s-()]+$/, 'Please enter a valid phone number'],
    default: null
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    default: 'prefer_not_to_say'
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  tagline: {
    type: String,
    maxlength: 100,
    default: ''
  },
  skills: {
    type: [String],
    default: []
  },
  socialLinks: {
    linkedin: String,
    github: String,
    portfolio: String
  },

  // Academic Information
  role: {
    type: String,
    required: true,
    enum: ['super_admin', 'admin', 'hod', 'faculty', 'student'],
    default: 'student'
  },
  employeeId: {
    type: String,
    sparse: true,
    unique: true,
    trim: true
  },
  studentId: {
    type: String,
    sparse: true,
    unique: true,
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    default: null
  },
  semester: {
    type: Number,
    min: 1,
    max: 10,
    default: null
  },
  section: {
    type: String,
    trim: true,
    default: null
  },
  batch: {
    type: String,
    trim: true,
    default: null
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  graduationDate: {
    type: Date,
    default: null
  },

  // Authentication & Security
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  lastPasswordChange: {
    type: Date,
    default: Date.now
  },
  loginAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  lockUntil: {
    type: Date,
    select: false
  },

  // Two-Factor Authentication
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  backupCodes: {
    type: [String],
    select: false,
    default: []
  },

  // Session Management
  refreshTokens: [{
    token: String,
    device: String,
    ip: String,
    userAgent: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  }],

  // Status & Activity
  isActive: {
    type: Boolean,
    default: true
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  suspensionReason: {
    type: String,
    default: null
  },
  suspensionEnds: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  lastLoginIP: {
    type: String,
    default: null
  },
  loginCount: {
    type: Number,
    default: 0
  },

  // Preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      assignments: {
        type: Boolean,
        default: true
      },
      grades: {
        type: Boolean,
        default: true
      },
      announcements: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'university', 'department', 'private'],
        default: 'university'
      },
      showEmail: {
        type: Boolean,
        default: false
      },
      showPhone: {
        type: Boolean,
        default: false
      }
    }
  },

  // Academic Performance (for students)
  academicInfo: {
    gpa: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    credits: {
      type: Number,
      min: 0,
      default: 0
    },
    backlogs: {
      type: Number,
      min: 0,
      default: 0
    },
    standing: {
      type: String,
      enum: ['excellent', 'good', 'average', 'poor'],
      default: 'average'
    }
  },

  // Faculty Information (for faculty)
  facultyInfo: {
    designation: {
      type: String,
      trim: true
    },
    specialization: {
      type: [String],
      default: []
    },
    qualification: {
      type: String,
      trim: true
    },
    experience: {
      type: Number,
      min: 0,
      default: 0
    },
    publications: {
      type: Number,
      min: 0,
      default: 0
    },
    researchInterests: {
      type: [String],
      default: []
    },
    office: {
      type: String,
      trim: true
    },
    officeHours: {
      type: String,
      trim: true
    }
  },

  // System Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Legacy compatibility
  name: {
    type: String,
    virtual: true,
    get: function () {
      return `${this.firstName} ${this.lastName}`;
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ programId: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ isEmailVerified: 1 });
userSchema.index({ createdAt: -1 });

// Virtuals
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.virtual('displayName').get(function () {
  if (this.role === 'student' && this.studentId) {
    return `${this.fullName} (${this.studentId})`;
  } else if (this.role === 'faculty' && this.employeeId) {
    return `${this.fullName} (${this.employeeId})`;
  }
  return this.fullName;
});

// Backward compatibility: allow legacy name payloads in tests/routes.

userSchema.pre('validate', function (next) {
  if ((!this.firstName || !this.lastName) && this.name) {
    const parts = String(this.name).trim().split(/\s+/);
    if (!this.firstName) this.firstName = parts[0] || 'User';
    if (!this.lastName) this.lastName = parts.slice(1).join(' ') || parts[0] || 'User';
  }
  next();
});
// Pre-save middleware
userSchema.pre('save', async function (next) {
  // Hash password if it's modified
  if (this.isModified('password')) {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    this.lastPasswordChange = new Date();
  }

  // Generate student ID for students
  if (this.isModified('role') && this.role === 'student' && !this.studentId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      role: 'student',
      studentId: new RegExp(`^STU${year}`)
    });
    this.studentId = `STU${year}${String(count + 1).padStart(4, '0')}`;
  }

  // Generate employee ID for faculty
  if (this.isModified('role') && ['faculty', 'hod', 'admin'].includes(this.role) && !this.employeeId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      role: { $in: ['faculty', 'hod', 'admin'] },
      employeeId: new RegExp(`^EMP${year}`)
    });
    this.employeeId = `EMP${year}${String(count + 1).padStart(4, '0')}`;
  }

  // Set name from firstName and lastName if not provided
  if (this.isModified('firstName') || this.isModified('lastName')) {
    this.name = `${this.firstName} ${this.lastName}`.trim();
  }

  next();
});

// Instance Methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role,
    department: this.department,
    permissions: this.getPermissions()
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

userSchema.methods.generateRefreshToken = function () {
  const payload = {
    id: this._id,
    type: 'refresh'
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE
  });
};

userSchema.methods.getPermissions = function () {
  const permissions = {
    super_admin: [
      'user:create', 'user:read', 'user:update', 'user:delete',
      'department:create', 'department:read', 'department:update', 'department:delete',
      'program:create', 'program:read', 'program:update', 'program:delete',
      'course:create', 'course:read', 'course:update', 'course:delete',
      'system:read', 'system:update', 'system:delete'
    ],
    admin: [
      'user:read', 'user:update',
      'department:create', 'department:read', 'department:update',
      'program:create', 'program:read', 'program:update',
      'course:create', 'course:read', 'course:update',
      'reports:read'
    ],
    hod: [
      'user:read', 'user:update',
      'department:read',
      'program:read',
      'course:create', 'course:read', 'course:update',
      'faculty:read', 'faculty:update',
      'reports:read'
    ],
    faculty: [
      'course:read',
      'assignment:create', 'assignment:read', 'assignment:update', 'assignment:grade',
      'student:read',
      'reports:read'
    ],
    student: [
      'course:read',
      'assignment:read', 'assignment:submit',
      'profile:read', 'profile:update'
    ]
  };

  return permissions[this.role] || [];
};

userSchema.methods.generateTwoFactorSecret = function () {
  const secret = speakeasy.generateSecret({
    name: `AI University (${this.email})`,
    issuer: 'AI University Platform'
  });

  this.twoFactorSecret = secret.base32;
  return secret;
};

userSchema.methods.verifyTwoFactorToken = function (token) {
  return speakeasy.totp.verify({
    secret: this.twoFactorSecret,
    encoding: 'base32',
    token: token,
    window: 2
  });
};

userSchema.methods.generateBackupCodes = function () {
  const crypto = require('crypto');
  const bcrypt = require('bcryptjs');
  const plaintextCodes = [];
  for (let i = 0; i < 10; i++) {
    plaintextCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  // Store hashed codes in DB; return plaintext to user once
  this.backupCodes = plaintextCodes.map(code => bcrypt.hashSync(code, 10));
  return plaintextCodes;
};

userSchema.methods.addRefreshToken = async function (token, device, ip, userAgent) {
  const now = new Date();
  const refreshTokenDoc = {
    token,
    device,
    ip,
    userAgent,
    createdAt: now,
    expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  };

  // Avoid Mongo path conflicts by splitting cleanup and append into separate updates.
  await this.updateOne({
    $pull: { refreshTokens: { expiresAt: { $lt: now } } }
  });

  return this.updateOne({
    $push: { refreshTokens: { $each: [refreshTokenDoc], $slice: -5 } }
  });
};

userSchema.methods.removeRefreshToken = function (token) {
  return this.updateOne({
    $pull: { refreshTokens: { token } }
  });
};

userSchema.methods.incrementLoginAttempts = async function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 15 minutes
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static Methods
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByStudentId = function (studentId) {
  return this.findOne({ studentId: studentId });
};

userSchema.statics.findByEmployeeId = function (employeeId) {
  return this.findOne({ employeeId: employeeId });
};

userSchema.statics.getActiveUsers = function (role = null) {
  const query = { isActive: true, isEmailVerified: true };
  if (role) query.role = role;
  return this.find(query);
};

userSchema.statics.getUsersByDepartment = function (departmentId) {
  return this.find({ department: departmentId, isActive: true });
};

userSchema.statics.searchUsers = function (searchTerm, filters = {}) {
  const query = {
    $and: [
      { isActive: true },
      {
        $or: [
          { firstName: { $regex: searchTerm, $options: 'i' } },
          { lastName: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { studentId: { $regex: searchTerm, $options: 'i' } },
          { employeeId: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    ]
  };

  if (filters.role) query.$and.push({ role: filters.role });
  if (filters.department) query.$and.push({ department: filters.department });
  if (filters.program) query.$and.push({ programId: filters.program });

  return this.find(query);
};

// Validation Methods
userSchema.methods.canAccessResource = function (resource, action) {
  const permissions = this.getPermissions();
  return permissions.includes(`${resource}:${action}`) ||
    permissions.includes(`${resource}:*`) ||
    permissions.includes('*');
};

userSchema.methods.isFaculty = function () {
  return ['faculty', 'hod', 'admin', 'super_admin'].includes(this.role);
};

userSchema.methods.isAdmin = function () {
  return ['admin', 'super_admin'].includes(this.role);
};

userSchema.methods.isSuperAdmin = function () {
  return this.role === 'super_admin';
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);




