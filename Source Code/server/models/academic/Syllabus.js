const mongoose = require('mongoose');

/**
 * Enhanced Syllabus Model
 * Breaks down a course into weekly topics for automated Lab/Problem generation
 */
const syllabusSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    unique: true
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program'
  },
  semester: Number,
  weeks: [{
    weekNumber: { type: Number, required: true },
    topic: { type: String, required: true },
    learningObjectives: [String],
    suggestedLabType: {
      type: String,
      enum: ['Programming', 'Simulation', 'Hardware', 'Research'],
      default: 'Programming'
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    }
  }],
  isAiGenerated: { type: Boolean, default: false },
  lastGeneratedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure weeks are sorted by number
syllabusSchema.pre('save', function (next) {
  if (this.weeks) {
    this.weeks.sort((a, b) => a.weekNumber - b.weekNumber);
  }
  next();
});

module.exports = mongoose.model('Syllabus', syllabusSchema);
