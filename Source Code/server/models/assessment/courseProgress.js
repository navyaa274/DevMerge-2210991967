const mongoose = require('mongoose');

const courseProgressSchema = new mongoose.Schema({
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
  completed_lessons: {
    type: Number,
    default: 0
  },
  total_lessons: {
    type: Number,
    default: 0
  },
  progress_percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completed_modules: {
    type: Number,
    default: 0
  },
  total_modules: {
    type: Number,
    default: 0
  },
  module_progress: [{
    module_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CourseModule'
    },
    completed_lessons: {
      type: Number,
      default: 0
    },
    total_lessons: {
      type: Number,
      default: 0
    },
    progress_percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completed: {
      type: Boolean,
      default: false
    },
    completed_at: Date
  }],
  time_spent_seconds: {
    type: Number,
    default: 0
  },
  last_activity_at: {
    type: Date,
    default: Date.now
  },
  started_at: {
    type: Date,
    default: Date.now
  },
  completed_at: Date,
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'dropped'],
    default: 'not_started'
  },
  current_module_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseModule'
  },
  current_lesson_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  certificate_earned: {
    type: Boolean,
    default: false
  },
  certificate_issued_at: Date,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound index for efficient queries
courseProgressSchema.index({ user_id: 1, course_id: 1 }, { unique: true });
courseProgressSchema.index({ user_id: 1, status: 1 });
courseProgressSchema.index({ course_id: 1, progress_percentage: 1 });

// Update last_activity_at when progress is updated
courseProgressSchema.pre('save', function(next) {
  this.last_activity_at = Date.now();

  // Calculate progress percentage
  if (this.total_lessons > 0) {
    this.progress_percentage = Math.round((this.completed_lessons / this.total_lessons) * 100);
  }

  // Update status based on progress
  if (this.progress_percentage === 100) {
    this.status = 'completed';
    if (!this.completed_at) {
      this.completed_at = Date.now();
    }
  } else if (this.completed_lessons > 0) {
    this.status = 'in_progress';
  }

  next();
});

module.exports = mongoose.model('CourseProgress', courseProgressSchema);
