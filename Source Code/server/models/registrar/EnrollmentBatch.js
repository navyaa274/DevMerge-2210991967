const mongoose = require('mongoose');

const enrollmentBatchSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    unique: true
  },
  program: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  processedStudents: {
    type: Number,
    default: 0
  },
  successfulEnrollments: {
    type: Number,
    default: 0
  },
  failedEnrollments: {
    type: Number,
    default: 0
  },
  interventions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['prerequisite', 'capacity', 'schedule_conflict', 'academic_standing']
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    message: String,
    recommendedActions: [String],
    status: {
      type: String,
      enum: ['pending', 'resolved', 'escalated'],
      default: 'pending'
    },
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  enrollmentData: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    courses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }],
    electives: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }],
    status: {
      type: String,
      enum: ['enrolled', 'waitlisted', 'intervention_required'],
      default: 'enrolled'
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    }
  }],
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  startedAt: Date,
  completedAt: Date,
  processingTime: Number, // in seconds
  errors: [{
    type: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  compliance: {
    prerequisiteCheck: Boolean,
    capacityCheck: Boolean,
    scheduleCheck: Boolean,
    academicStandingCheck: Boolean
  },
  audit: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    notes: String
  }
}, {
  timestamps: true
});

// Indexes
enrollmentBatchSchema.index({ batchId: 1 });
enrollmentBatchSchema.index({ program: 1, semester: 1 });
enrollmentBatchSchema.index({ status: 1 });
enrollmentBatchSchema.index({ createdAt: -1 });

module.exports = mongoose.model('EnrollmentBatch', enrollmentBatchSchema);
