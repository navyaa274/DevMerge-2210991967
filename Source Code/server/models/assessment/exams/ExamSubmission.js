const mongoose = require('mongoose');

const examSubmissionSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: { type: mongoose.Schema.Types.Mixed, default: {} },
  score: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  proctoringLog: [{
    event: String,
    timestamp: Date,
    details: String
  }],
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.ExamSubmission || mongoose.model('ExamSubmission', examSubmissionSchema);
