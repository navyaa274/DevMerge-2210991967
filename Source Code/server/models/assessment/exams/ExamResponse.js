const mongoose = require('mongoose');

const examResponseSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    answer: String,
    submittedAt: Date
  }],
  startTime: { type: Date, required: true },
  endTime: Date,
  totalTime: Number, // seconds
  score: Number,
  status: { 
    type: String, 
    enum: ['in_progress', 'submitted', 'graded'],
    default: 'in_progress'
  },
  tabSwitches: { type: Number, default: 0 },
  ipAddress: String,
  sessionId: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ExamResponse', examResponseSchema);
