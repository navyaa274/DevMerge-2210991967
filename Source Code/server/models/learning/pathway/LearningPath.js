const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  topics: [String],
  modules: [{
    moduleId: mongoose.Schema.Types.ObjectId,
    title: String,
    description: String,
    estimatedTime: Number,
    order: Number,
    content: [{
      type: { type: String, enum: ['video', 'problem', 'quiz', 'assignment', 'reading'], required: true },
      contentId: mongoose.Schema.Types.ObjectId,
      title: String,
      duration: Number, // in minutes
      isRequired: { type: Boolean, default: true },
      order: Number
    }]
  }],
  estimatedDuration: Number,
  prerequisites: [mongoose.Schema.Types.ObjectId],
  skills: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  enrolledUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  rating: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LearningPath', learningPathSchema);
