const mongoose = require('mongoose');

const aiTutorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null // null means available for all courses
  },
  specialization: [{
    type: String,
    trim: true
  }],
  capabilities: [{
    type: String,
    enum: ['explain_concepts', 'answer_questions', 'provide_examples', 'debug_code', 'generate_exercises', 'assess_understanding']
  }],
  personality: {
    type: String,
    enum: ['friendly', 'professional', 'encouraging', 'strict', 'humorous'],
    default: 'friendly'
  },
  avatar_url: {
    type: String,
    trim: true
  },
  system_prompt: {
    type: String,
    required: true
  },
  model_config: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  is_active: {
    type: Boolean,
    default: true
  },
  usage_stats: {
    total_conversations: {
      type: Number,
      default: 0
    },
    total_messages: {
      type: Number,
      default: 0
    },
    average_rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    last_used: Date
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
aiTutorSchema.index({ subject: 1 });
aiTutorSchema.index({ course_id: 1 });
aiTutorSchema.index({ is_active: 1 });
aiTutorSchema.index({ capabilities: 1 });
aiTutorSchema.index({ 'usage_stats.last_used': -1 });

// Update the updated_at field before saving
aiTutorSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('AITutor', aiTutorSchema);
