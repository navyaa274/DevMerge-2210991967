const mongoose = require('mongoose');

const learningRecommendationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  },
  problem_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    default: null
  },
  recommendation_type: {
    type: String,
    enum: ['practice_exercise', 'concept_review', 'difficulty_adjustment', 'learning_path', 'peer_learning', 'resource_suggestion'],
    required: true
  },
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
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  confidence_score: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  reasoning: {
    type: String,
    trim: true
  },
  trigger_event: {
    type: String,
    enum: ['poor_performance', 'concept_struggle', 'time_spent', 'pattern_recognition', 'milestone_achievement', 'scheduled_review'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'delivered', 'accepted', 'rejected', 'completed', 'expired'],
    default: 'pending'
  },
  delivered_at: Date,
  action_taken_at: Date,
  outcome: {
    type: String,
    enum: ['positive', 'neutral', 'negative', 'not_applicable'],
    default: 'not_applicable'
  },
  feedback_rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  user_feedback: {
    type: String,
    trim: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  expires_at: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
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
learningRecommendationSchema.index({ user_id: 1, created_at: -1 });
learningRecommendationSchema.index({ course_id: 1 });
learningRecommendationSchema.index({ problem_id: 1 });
learningRecommendationSchema.index({ recommendation_type: 1 });
learningRecommendationSchema.index({ priority: 1 });
learningRecommendationSchema.index({ status: 1 });
learningRecommendationSchema.index({ trigger_event: 1 });
learningRecommendationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// Update the updated_at field before saving
learningRecommendationSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('LearningRecommendation', learningRecommendationSchema);
