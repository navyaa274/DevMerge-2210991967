const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  module_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseModule',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['video', 'pdf', 'document', 'link', 'text', 'code', 'interactive', 'quiz'],
    required: true,
    default: 'text'
  },
  content: {
    type: String,
    required: true
  },
  content_url: {
    type: String,
    trim: true
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  order_index: {
    type: Number,
    required: true,
    default: 0
  },
  is_published: {
    type: Boolean,
    default: true
  },
  is_required: {
    type: Boolean,
    default: true
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  tags: [{
    type: String,
    trim: true
  }],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
lessonSchema.index({ module_id: 1, order_index: 1 });
lessonSchema.index({ module_id: 1, is_published: 1 });
lessonSchema.index({ type: 1 });

// Update the updated_at field before saving
lessonSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Lesson', lessonSchema);
