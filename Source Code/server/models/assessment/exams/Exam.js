const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examType: { 
    type: String, 
    enum: ['MCQ', 'Coding', 'Descriptive', 'Mixed'],
    required: true
  },
  questions: [{
    type: { type: String, enum: ['mcq', 'coding', 'descriptive'] },
    title: String,
    description: String,
    options: [String], // for MCQ
    correctAnswer: String, // for MCQ
    problem: mongoose.Schema.Types.ObjectId, // for coding
    marks: Number,
    order: Number
  }],
  duration: { type: Number, required: true }, // minutes
  totalMarks: Number,
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  shuffleQuestions: { type: Boolean, default: true },
  showResults: { type: Boolean, default: false },
  enableTabSwitch: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Exam || mongoose.model('Exam', examSchema);
