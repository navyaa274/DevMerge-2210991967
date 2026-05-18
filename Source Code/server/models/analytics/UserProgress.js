const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  learningPath: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningPath',
    required: true
  },
  completedContent: [{
    contentType: {
      type: String,
      enum: ['video', 'quiz', 'problem', 'assignment', 'reading'],
      required: true
    },
    contentId: String, // Can be ObjectId or title for reading materials
    moduleIndex: Number,
    contentIndex: Number,
    completedAt: {
      type: Date,
      default: Date.now
    },
    score: Number // For quizzes
  }],
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
userProgressSchema.index({ user: 1, learningPath: 1 }, { unique: true });

// Method to mark content as complete
userProgressSchema.methods.markComplete = function(contentType, contentId, moduleIndex, contentIndex, score = null) {
  // Check if already completed
  const exists = this.completedContent.some(
    item => item.contentType === contentType && 
            item.contentId === contentId && 
            item.moduleIndex === moduleIndex &&
            item.contentIndex === contentIndex
  );

  if (!exists) {
    this.completedContent.push({
      contentType,
      contentId,
      moduleIndex,
      contentIndex,
      score,
      completedAt: new Date()
    });
  }

  this.lastAccessedAt = new Date();
  this.updatedAt = new Date();
};

// Method to check if content is completed
userProgressSchema.methods.isCompleted = function(contentType, contentId, moduleIndex, contentIndex) {
  return this.completedContent.some(
    item => item.contentType === contentType && 
            item.contentId === contentId &&
            item.moduleIndex === moduleIndex &&
            item.contentIndex === contentIndex
  );
};

module.exports = mongoose.model('UserProgress', userProgressSchema);
