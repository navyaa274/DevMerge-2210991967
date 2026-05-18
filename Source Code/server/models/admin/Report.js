const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['student_performance', 'course_analytics', 'department_summary', 'plagiarism', 'engagement'],
    required: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filters: {
    startDate: Date,
    endDate: Date,
    courseId: mongoose.Schema.Types.ObjectId,
    departmentId: mongoose.Schema.Types.ObjectId,
    studentIds: [mongoose.Schema.Types.ObjectId]
  },
  data: mongoose.Schema.Types.Mixed,
  format: {
    type: String,
    enum: ['pdf', 'csv', 'json'],
    default: 'pdf'
  },
  fileUrl: String,
  status: {
    type: String,
    enum: ['pending', 'generating', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date
});

module.exports = mongoose.model('Report', reportSchema);
