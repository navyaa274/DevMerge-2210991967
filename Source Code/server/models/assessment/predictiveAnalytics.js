const mongoose = require('mongoose');

const predictiveAnalyticsSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  prediction_type: {
    type: String,
    enum: ['completion_probability', 'grade_prediction', 'dropout_risk', 'time_to_completion', 'skill_mastery', 'engagement_level'],
    required: true
  },
  prediction_value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  confidence_score: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  prediction_date: {
    type: Date,
    default: Date.now
  },
  data_points_used: {
    type: Number,
    min: 0,
    default: 0
  },
  features_used: [{
    name: String,
    value: mongoose.Schema.Types.Mixed,
    weight: Number
  }],
  model_version: {
    type: String,
    required: true
  },
  accuracy_assessment: {
    type: String,
    enum: ['pending', 'accurate', 'inaccurate', 'partially_accurate'],
    default: 'pending'
  },
  actual_outcome: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  assessment_date: Date,
  time_horizon: {
    type: String,
    enum: ['short_term', 'medium_term', 'long_term'],
    default: 'medium_term'
  },
  category: {
    type: String,
    enum: ['academic_performance', 'engagement', 'completion', 'risk_assessment'],
    required: true
  },
  alerts_triggered: [{
    type: {
      type: String,
      enum: ['email', 'dashboard', 'instructor_notification']
    },
    triggered_at: Date,
    recipient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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
predictiveAnalyticsSchema.index({ user_id: 1, prediction_type: 1, prediction_date: -1 });
predictiveAnalyticsSchema.index({ course_id: 1 });
predictiveAnalyticsSchema.index({ prediction_type: 1 });
predictiveAnalyticsSchema.index({ category: 1 });
predictiveAnalyticsSchema.index({ confidence_score: -1 });
predictiveAnalyticsSchema.index({ time_horizon: 1 });
predictiveAnalyticsSchema.index({ accuracy_assessment: 1 });

// Update the updated_at field before saving
predictiveAnalyticsSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('PredictiveAnalytics', predictiveAnalyticsSchema);
