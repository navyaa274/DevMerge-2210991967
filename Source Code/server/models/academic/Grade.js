const mongoose = require('mongoose');

/**
 * Grade Model
 * Represents student grades for courses and assessments
 */

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true
  },
  grades: {
    assignments: [{
      assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment'
      },
      marks: Number,
      maxMarks: Number,
      percentage: Number,
      gradedAt: Date
    }],
    exams: [{
      exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
      },
      marks: Number,
      maxMarks: Number,
      percentage: Number,
      gradedAt: Date
    }],
    final: {
      marks: Number,
      maxMarks: Number,
      percentage: Number,
      grade: String,
      gpa: Number,
      gradedAt: Date
    }
  },
  attendance: {
    totalClasses: Number,
    attendedClasses: Number,
    percentage: Number
  },
  overall: {
    totalMarks: Number,
    obtainedMarks: Number,
    percentage: Number,
    grade: String,
    gpa: Number,
    status: {
      type: String,
      enum: ['pass', 'fail', 'incomplete'],
      default: 'incomplete'
    }
  },
  remarks: String,
  gradedBy: {
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
});

// Indexes
gradeSchema.index({ student: 1, course: 1 });
gradeSchema.index({ course: 1, semester: 1 });

// Update updatedAt on save
gradeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Grade', gradeSchema);
