const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['student', 'faculty', 'course', 'department', 'global'],
    required: true
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  
  // Student metrics
  totalSubmissions: Number,
  acceptedSubmissions: Number,
  acceptanceRate: Number,
  topicStats: {
    type: Map,
    of: Number
  },
  weakestTopics: [String],
  performanceTrend: [{
    date: Date,
    score: Number
  }],
  
  // Faculty metrics
  totalProblems: Number,
  avgProblemDifficulty: String,
  studentEngagement: Number,
  
  // Course metrics
  enrollmentCount: Number,
  avgScore: Number,
  completionRate: Number,
  
  // Department metrics
  departmentRanking: Number,
  avgStudentPerformance: Number,
  
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
