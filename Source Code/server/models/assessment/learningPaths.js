const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  learning_objectives: [{
    type: String,
    trim: true
  }],
  path_type: {
    type: String,
    enum: ['personalized', 'remedial', 'advanced', 'skill_building', 'review'],
    default: 'personalized'
  },
  difficulty_level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  estimated_duration_hours: {
    type: Number,
    min: 0,
    default: 0
  },
  nodes: [{
    node_id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['lesson', 'problem', 'resource', 'assessment', 'milestone'],
      required: true
    },
    content_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    prerequisites: [{
      type: String // node_id references
    }],
    estimated_time_minutes: {
      type: Number,
      min: 0,
      default: 30
    },
    difficulty_score: {
      type: Number,
      min: 0,
      max: 10,
      default: 5
    },
    skills_covered: [{
      type: String,
      trim: true
    }],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  edges: [{
    from_node: {
      type: String,
      required: true
    },
    to_node: {
      type: String,
      required: true
    },
    condition: {
      type: String,
      enum: ['always', 'completion_required', 'minimum_score', 'skill_mastery'],
      default: 'always'
    },
    condition_value: mongoose.Schema.Types.Mixed, // e.g., minimum score threshold
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  current_position: {
    node_id: String,
    started_at: Date,
    completed_at: Date
  },
  progress_percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'paused', 'archived'],
    default: 'draft'
  },
  generated_by: {
    type: String,
    enum: ['ai_system', 'instructor', 'self_paced'],
    default: 'ai_system'
  },
  ai_model_version: {
    type: String,
    default: null
  },
  user_feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    comments: String,
    submitted_at: Date
  },
  performance_metrics: {
    average_score: Number,
    completion_rate: Number,
    time_spent_hours: Number,
    skills_improved: [String],
    last_updated: Date
  },
  expires_at: {
    type: Date,
    default: null
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
learningPathSchema.index({ user_id: 1, created_at: -1 });
learningPathSchema.index({ course_id: 1 });
learningPathSchema.index({ path_type: 1 });
learningPathSchema.index({ difficulty_level: 1 });
learningPathSchema.index({ status: 1 });
learningPathSchema.index({ 'current_position.node_id': 1 });

// Update the updated_at field before saving
learningPathSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('LearningPath', learningPathSchema);
