const mongoose = require('mongoose');

const aiConversationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ai_tutor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AITutor',
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
  session_id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    trim: true
  },
  context: {
    type: String,
    enum: ['general_learning', 'problem_solving', 'concept_explanation', 'debugging', 'exercise_generation', 'assessment'],
    default: 'general_learning'
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  },
  user_rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  user_feedback: {
    type: String,
    trim: true
  },
  tokens_used: {
    type: Number,
    min: 0,
    default: 0
  },
  duration_seconds: {
    type: Number,
    min: 0,
    default: 0
  },
  learning_objectives: [{
    type: String,
    trim: true
  }],
  concepts_covered: [{
    type: String,
    trim: true
  }],
  difficulty_level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  last_activity: {
    type: Date,
    default: Date.now
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
aiConversationSchema.index({ user_id: 1, created_at: -1 });
aiConversationSchema.index({ ai_tutor_id: 1 });
aiConversationSchema.index({ course_id: 1 });
aiConversationSchema.index({ session_id: 1 }, { unique: true });
aiConversationSchema.index({ status: 1 });
aiConversationSchema.index({ last_activity: -1 });
aiConversationSchema.index({ context: 1 });

// Update the updated_at field before saving
aiConversationSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  this.last_activity = Date.now();
  next();
});

module.exports = mongoose.model('AIConversation', aiConversationSchema);
