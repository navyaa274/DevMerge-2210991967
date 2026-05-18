const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dueDate: { type: Date, required: true },
  totalMarks: { type: Number, default: 0 },
  coMappings: [{
    coCode: String, // e.g. "CO1"
    weightage: Number // Percentage of total marks or direct marks
  }],
  questions: [{
    text: String,
    marks: Number,
    coMapping: [String], // Array of CO codes
    bloomLevel: String
  }],
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    submittedAt: Date,
    grade: Number,
    feedback: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);
