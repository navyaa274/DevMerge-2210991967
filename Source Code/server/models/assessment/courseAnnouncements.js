const mongoose = require('mongoose');

const courseAnnouncementSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  announcement_type: {
    type: String,
    enum: ['general', 'assignment', 'exam', 'grade', 'schedule', 'important', 'reminder'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  is_pinned: {
    type: Boolean,
    default: false
  },
  is_published: {
    type: Boolean,
    default: true
  },
  published_at: {
    type: Date,
    default: Date.now
  },
  expires_at: {
    type: Date
  },
  attachment_url: {
    type: String,
    trim: true
  },
  attachment_name: {
    type: String,
    trim: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  view_count: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes
courseAnnouncementSchema.index({ course_id: 1, is_published: 1, published_at: -1 });
courseAnnouncementSchema.index({ course_id: 1, is_pinned: -1, published_at: -1 });
courseAnnouncementSchema.index({ created_by: 1 });
courseAnnouncementSchema.index({ expires_at: 1 });
courseAnnouncementSchema.index({ announcement_type: 1 });

// Virtual for is_expired
courseAnnouncementSchema.virtual('is_expired').get(function() {
  return this.expires_at && new Date() > this.expires_at;
});

// Update the updated_at field before saving
courseAnnouncementSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('CourseAnnouncement', courseAnnouncementSchema);
