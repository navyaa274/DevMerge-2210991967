const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }], // Support multiple (Phase 6 Item 47)
  isInterDepartmental: { type: Boolean, default: false },
  problems: [{
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
    points: { type: Number, default: 100 }
  }],
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    registeredAt: { type: Date, default: Date.now }
  }],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: Number, // in minutes

  // Proctored Settings (Phase 5 Item 14)
  settings: {
    isProctored: { type: Boolean, default: false },
    allowTabSwitching: { type: Boolean, default: true },
    maxTabSwitches: { type: Number, default: 3 },
    requireCamera: { type: Boolean, default: false },
    ipLocking: { type: Boolean, default: false }
  },

  // Scoring Rule Engine (Phase 5 Item 15)
  scoringType: {
    type: String,
    enum: ['ACM', 'IOI', 'Points'],
    default: 'ACM'
  },
  penaltyPerWrongSubmission: {
    type: Number,
    default: 20 // minutes for ACM
  },

  isPublic: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'ongoing', 'ended'],
    default: 'scheduled'
  },
  xpMultiplier: { type: Number, default: 1.0 }, // Phase 5 Item 16
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-slug
contestSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Contest', contestSchema);
