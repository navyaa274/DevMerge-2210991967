const mongoose = require('mongoose');

const programOutcomeSchema = new mongoose.Schema({
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: true
  },
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['PO', 'PSO'],
    default: 'PO'
  },
  bloomLevel: {
    type: String,
    enum: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'],
    default: 'Apply'
  },
  weightage: {
    type: Number,
    default: 1
  },
  attainmentLevel: {
    type: Number,
    default: 0
  },
  mappedCourses: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    mappingLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' }
  }],
  assessmentMethods: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

programOutcomeSchema.statics.getProgramPOs = async function (programId) {
  if (programId === 'default' || !mongoose.Types.ObjectId.isValid(programId)) return [];
  return this.find({ program: programId, type: 'PO', isActive: { $ne: false } });
};

programOutcomeSchema.statics.getProgramPSOs = async function (programId) {
  if (programId === 'default' || !mongoose.Types.ObjectId.isValid(programId)) return [];
  return this.find({ program: programId, type: 'PSO', isActive: { $ne: false } });
};

module.exports = mongoose.model('ProgramOutcome', programOutcomeSchema);
