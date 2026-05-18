const mongoose = require('mongoose');

/**
 * Attendance Model
 * Tracks student attendance for courses
 */

const attendanceSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  records: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      required: true
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    markedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  totalPresent: {
    type: Number,
    default: 0
  },
  totalAbsent: {
    type: Number,
    default: 0
  },
  totalLate: {
    type: Number,
    default: 0
  },
  totalExcused: {
    type: Number,
    default: 0
  },
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
attendanceSchema.index({ course: 1, date: 1 });
attendanceSchema.index({ faculty: 1 });

// Update counts and updatedAt on save
attendanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Calculate totals
  this.totalPresent = this.records.filter(r => r.status === 'present').length;
  this.totalAbsent = this.records.filter(r => r.status === 'absent').length;
  this.totalLate = this.records.filter(r => r.status === 'late').length;
  this.totalExcused = this.records.filter(r => r.status === 'excused').length;

  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
