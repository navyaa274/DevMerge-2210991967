const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lesson_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completed_at: {
    type: Date
  },
  time_spent_seconds: {
    type: Number,
    default: 0
  },
  progress_percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  last_accessed_at: {
    type: Date,
    default: Date.now
  },
  attempts_count: {
    type: Number,
    default: 1
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound index for efficient queries
lessonProgressSchema.index({ user_id: 1, lesson_id: 1 }, { unique: true });
lessonProgressSchema.index({ user_id: 1, completed: 1 });
lessonProgressSchema.index({ lesson_id: 1, completed: 1 });

// Update last_accessed_at when progress is updated
lessonProgressSchema.pre('save', function(next) {
  this.last_accessed_at = Date.now();
  next();
});

module.exports = mongoose.model('LessonProgress', lessonProgressSchema);
