const mongoose = require('mongoose');

const courseModuleSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
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
  estimated_duration: {
    type: Number, // in minutes
    default: 0
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseModule'
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
courseModuleSchema.index({ course_id: 1, order_index: 1 });
courseModuleSchema.index({ course_id: 1, is_published: 1 });

// Update the updated_at field before saving
courseModuleSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('CourseModule', courseModuleSchema);
