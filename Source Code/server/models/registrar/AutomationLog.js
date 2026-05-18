const mongoose = require('mongoose');

const automationLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['enrollment', 'timetable', 'grading', 'compliance', 'intervention'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'completed'
  },
  triggeredBy: {
    type: String,
    enum: ['system', 'admin', 'scheduler'],
    default: 'system'
  },
  affectedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  affectedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  metrics: {
    processed: Number,
    success: Number,
    failed: Number,
    warnings: Number
  },
  errors: [{
    type: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  recommendations: [{
    type: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    description: String,
    implementation: String
  }]
}, {
  timestamps: true
});

// Indexes for efficient querying
automationLogSchema.index({ type: 1, timestamp: -1 });
automationLogSchema.index({ timestamp: -1 });
automationLogSchema.index({ status: 1 });

module.exports = mongoose.model('AutomationLog', automationLogSchema);
