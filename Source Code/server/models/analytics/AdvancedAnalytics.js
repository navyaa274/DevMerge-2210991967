const mongoose = require('mongoose');

const advancedAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  metrics: {
    timeSpent: Number,
    problemsSolved: Number,
    submissionsCount: Number,
    successRate: Number,
    averageScore: Number,
    topicsProgress: [{
      topic: String,
      proficiency: Number,
      problemsSolved: Number
    }]
  },
  predictions: {
    estimatedCompletion: Date,
    successProbability: Number,
    recommendedTopics: [String]
  },
  trends: {
    weeklyProgress: [Number],
    monthlyProgress: [Number],
    engagementTrend: String
  }
});

module.exports = mongoose.model('AdvancedAnalytics', advancedAnalyticsSchema);
