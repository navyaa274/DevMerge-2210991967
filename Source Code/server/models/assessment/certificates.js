const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  type: {
    type: String,
    enum: ['course_completion', 'achievement', 'skill_certification', 'participation'],
    default: 'course_completion'
  },
  criteria: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  template_data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  is_active: {
    type: Boolean,
    default: true
  },
  auto_issue: {
    type: Boolean,
    default: false
  },
  validity_period: {
    type: Number, // months
    default: null
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes
certificateSchema.index({ course_id: 1 });
certificateSchema.index({ type: 1 });
certificateSchema.index({ is_active: 1 });
certificateSchema.index({ created_by: 1 });

// Update the updated_at field before saving
certificateSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
