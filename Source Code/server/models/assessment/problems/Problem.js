const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  topics: [String],
  constraints: String,
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  hints: [String],
  tags: [String],
  bloomsLevel: {
    type: String,
    enum: ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]
  },
  testCases: [{
    input: String,
    output: String,
    isHidden: { type: Boolean, default: false },
    weight: Number,
    difficulty: String
  }],
  starterCode: {
    type: Map,
    of: String,
    default: {}
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  acceptanceRate: { type: Number, default: 0 },
  totalSubmissions: { type: Number, default: 0 },
  acceptedSubmissions: { type: Number, default: 0 },
  timeLimit: { type: Number, default: 1000 }, // ms
  memoryLimit: { type: Number, default: 256 }, // MB
  isApproved: { type: Boolean, default: false },
  isAiGenerated: { type: Boolean, default: false },
  category: {
    type: String,
    enum: ['problem', 'lab'],
    default: 'problem'
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Approved'],
    default: 'Published'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-generate slug from title before saving
problemSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

module.exports = mongoose.model('Problem', problemSchema);
