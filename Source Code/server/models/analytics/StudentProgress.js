const mongoose = require('mongoose');

const studentProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  topicsProgress: [{
    topicName: String,
    problemsSolved: Number,
    totalProblems: Number,
    proficiency: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    }
  }],
  estimatedCompletionDate: Date,
  learningPath: [{
    stepId: String,
    completed: Boolean,
    completedAt: Date
  }],
  lastAccessedAt: Date,
  timeSpent: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

studentProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('StudentProgress', studentProgressSchema);
